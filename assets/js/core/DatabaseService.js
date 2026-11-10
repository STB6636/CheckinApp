/**
 * @file assets/js/core/DatabaseService.js
 * @description คลาส Singleton สำหรับจัดการการเชื่อมต่อ Supabase Database
 */

import { Config } from './Config.js';

export class DatabaseService {
    static #instance = null;
    #client = null;
    #publicClient = null;

    constructor() {
        if (DatabaseService.#instance) {
            return DatabaseService.#instance;
        }
        this.#initClient();
        DatabaseService.#instance = this;
    }

    /**
     * ดึงอินสแตนซ์เดียวของ DatabaseService (Singleton)
     * @returns {DatabaseService}
     */
    static getInstance() {
        if (!DatabaseService.#instance) {
            DatabaseService.#instance = new DatabaseService();
        }
        return DatabaseService.#instance;
    }

    /**
     * เริ่มต้นสร้าง Supabase Client จาก Global Object window.supabase
     */
    #initClient() {
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            console.error('ไม่พบไลบรารี Supabase JS บนหน้าเว็บ กรุณาตรวจสอบแท็ก <script> ของ @supabase/supabase-js');
            return;
        }
        const clientOptions = {
            auth: {
                persistSession: false
            }
        };
        const activeSchema = Config.SUPABASE_SCHEMA || 'public';
        if (activeSchema && activeSchema !== 'public') {
            clientOptions.db = { schema: activeSchema };
        }
        this.#client = window.supabase.createClient(
            Config.SUPABASE_URL,
            Config.SUPABASE_ANON_KEY,
            clientOptions
        );
        this.#publicClient = window.supabase.createClient(
            Config.SUPABASE_URL,
            Config.SUPABASE_ANON_KEY,
            { auth: { persistSession: false } }
        );
        window.supabaseClient = this.#client;
    }

    /**
     * คืนค่า Supabase Client เพื่อใช้เรียกตารางต่างๆ
     */
    get client() {
        if (!this.#client) {
            this.#initClient();
        }
        return this.#client;
    }

    get publicClient() {
        if (!this.#publicClient) {
            this.#initClient();
        }
        return this.#publicClient;
    }

    /**
     * เมธอดช่วยตรวจสอบการเชื่อมต่อกับตารางฐานข้อมูล
     * @returns {Promise<boolean>}
     */
    async checkConnection() {
        try {
            const { error } = await this.client
                .from('system_settings')
                .select('id')
                .limit(1);
            if (error && String(error.message || '').includes('The schema must be one of the following: public')) {
                console.warn('[DatabaseService] Schema staging is not exposed in Supabase Dashboard yet, falling back to public schema');
                this.#client = this.#publicClient;
                const retry = await this.#client.from('system_settings').select('id').limit(1);
                return !retry.error;
            }
            return !error;
        } catch (err) {
            console.error('Database connection check failed:', err);
            return false;
        }
    }
}
/**
 * @file assets/js/core/DatabaseService.js
 * @description คลาส Singleton สำหรับจัดการการเชื่อมต่อ Supabase Database
 */

import { Config } from './Config.js';

export class DatabaseService {
    static #instance = null;
    #client = null;

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
        this.#client = window.supabase.createClient(
            Config.SUPABASE_URL,
            Config.SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false
                }
            }
        );
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
            return !error;
        } catch (err) {
            console.error('Database connection check failed:', err);
            return false;
        }
    }
}
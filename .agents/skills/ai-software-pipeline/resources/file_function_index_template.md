# สารบัญไฟล์และฟังก์ชัน (File & Function Symbol Index)

---
## File: `src/server/services/order.service.ts`
- **Layer:** Backend Business Logic Service
- **Total Lines:** 215
- **Imports:** `prisma` (`src/lib/prisma.ts`), `InventoryRepo` (`src/server/repositories/inventory.repo.ts`), `AppError` (`src/utils/AppError.ts`)
- **Exports:** `OrderService` (Class)

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ | ชนิด (Type) | ช่วงบรรทัด (Line Range) | พารามิเตอร์ขาเข้า (Inputs) | ค่าที่ส่งกลับ (Return Type) | หน้าที่และการทำงานย่อ (Responsibility & Side Effects) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `OrderService.validateCartItems` | `private async method` | **L15 - L54** | `items: CartItemDTO[]` | `Promise<ValidatedItem[]>` | ตรวจสอบราคาและสถานะการเปิดขายของสินค้าแต่ละรายการจาก DB |
| `OrderService.executeOrderTransaction` | `public async method` | **L55 - L160** | `userId: string, payload: CreateOrderDTO` | `Promise<OrderResponseDTO>` | เปิด Prisma `$transaction` เพื่อตัดสต็อก สร้างใบสั่งซื้อ และบันทึกประวัติการชำระเงิน |
| `OrderService.cancelExpiredOrders` | `public async method` | **L161 - L215** | `cutoffMinutes: number` | `Promise<number>` | ยกเลิกคำสั่งซื้อที่ค้างชำระเกินเวลาที่กำหนดและคืนสต็อกสินค้ากลับเข้าคลัง |

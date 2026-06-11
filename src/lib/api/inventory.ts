import { supabase } from '@/lib/supabase'
import type { InventoryItem, InventoryItemWithStock, InventoryMovement, InventoryCategory, InventoryUnit } from '@/types'

type RawItem = InventoryItem & { inventory_movements: InventoryMovement[] }

function computeStock(item: RawItem): InventoryItemWithStock {
  const movements = item.inventory_movements ?? []
  const current_stock = movements.reduce(
    (sum, m) => sum + (m.type === 'entrada' ? m.quantity : -m.quantity),
    0
  )
  const last_restock = movements
    .filter(m => m.type === 'entrada')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    ?.created_at ?? null

  const { inventory_movements: _m, ...itemData } = item
  return { ...itemData, current_stock, last_restock }
}

export async function getInventoryWithStock(): Promise<InventoryItemWithStock[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, inventory_movements(*)')
    .order('name')

  if (error || !data) return []
  return (data as RawItem[]).map(computeStock)
}

export async function getInventoryItem(id: string): Promise<InventoryItemWithStock | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, inventory_movements(*)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return computeStock(data as RawItem)
}

export async function getLowStockCount(): Promise<number> {
  const items = await getInventoryWithStock()
  return items.filter(i => i.current_stock < i.min_stock).length
}

export async function getInventoryItemByBarcode(barcode: string): Promise<InventoryItemWithStock | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, inventory_movements(*)')
    .eq('barcode', barcode)
    .single()

  if (error || !data) return null
  return computeStock(data as RawItem)
}

export async function assignBarcode(itemId: string, barcode: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('inventory_items')
    .update({ barcode })
    .eq('id', itemId)

  if (error) return { error: error.message }
  return {}
}

export async function createInventoryItem(data: {
  name: string
  category: InventoryCategory
  unit: InventoryUnit
  min_stock: number
  barcode?: string
}): Promise<{ data?: InventoryItem; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert({ ...data, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: item as InventoryItem }
}

export async function updateInventoryItem(id: string, data: {
  name: string
  category: InventoryCategory
  unit: InventoryUnit
  min_stock: number
}): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('inventory_items')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteInventoryItem(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function getMovementsForItem(itemId: string): Promise<InventoryMovement[]> {
  const { data } = await supabase
    .from('inventory_movements')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })

  return (data ?? []) as InventoryMovement[]
}

export async function createMovement(data: {
  item_id: string
  type: 'entrada' | 'salida'
  quantity: number
  notes?: string
}): Promise<{ data?: InventoryMovement; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: movement, error } = await supabase
    .from('inventory_movements')
    .insert({ ...data, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: movement as InventoryMovement }
}

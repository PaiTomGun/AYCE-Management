import { NextResponse } from 'next/server';
import { getMenuItems, query, generateId } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tierId = searchParams.get('tierId') || undefined;
    
    const menuItems = await getMenuItems(tierId);
    
    // Get tier information for each menu item
    const itemsWithTiers = await Promise.all(menuItems.map(async (item: any) => {
      const tiers = await query(
        `SELECT t.id, t.code, t.display_name 
         FROM tiers t 
         JOIN menu_item_tiers mit ON t.id = mit.tier_id 
         WHERE mit.item_id = $1 AND t.archived_at IS NULL`,
        [item.id]
      );
      return { ...item, tiers };
    }));
    
    // Group by category
    const grouped = itemsWithTiers.reduce((acc: any, item: any) => {
      const category = item.category_name || 'อื่นๆ';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    
    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, category, imageBase64, isAvailable, tierIds } = await request.json();
    
    // Get or create category
    let categoryId = await query(
      'SELECT id FROM menu_categories WHERE name = $1',
      [category]
    );
    
    if (categoryId.length === 0) {
      const newCatId = generateId();
      await query(
        'INSERT INTO menu_categories (id, name, position, created_at) VALUES ($1, $2, $3, $4)',
        [newCatId, category, 99, new Date()]
      );
      categoryId = [{ id: newCatId }];
    }
    
    // Convert empty string to null for image_base64
    const imageValue = imageBase64 && imageBase64.trim() !== '' ? imageBase64 : null;
    
    const itemId = generateId();
    await query(
      `INSERT INTO menu_items (id, name, description, category_id, image_base64, is_available, is_deleted, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)`,
      [itemId, name, description, categoryId[0].id, imageValue, isAvailable, new Date(), new Date()]
    );
    
    // Insert tier associations
    if (tierIds && Array.isArray(tierIds) && tierIds.length > 0) {
      for (const tierId of tierIds) {
        const mitId = generateId();
        await query(
          'INSERT INTO menu_item_tiers (id, item_id, tier_id) VALUES ($1, $2, $3)',
          [mitId, itemId, tierId]
        );
      }
    }
    
    return NextResponse.json({ success: true, itemId });
  } catch (error) {
    console.error('Menu POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { itemId, name, description, category, imageBase64, isAvailable, tierIds } = await request.json();
    
    // Get or create category
    let categoryId = await query(
      'SELECT id FROM menu_categories WHERE name = $1',
      [category]
    );
    
    if (categoryId.length === 0) {
      const newCatId = generateId();
      await query(
        'INSERT INTO menu_categories (id, name, position, created_at) VALUES ($1, $2, $3, $4)',
        [newCatId, category, 99, new Date()]
      );
      categoryId = [{ id: newCatId }];
    }
    
    // Convert empty string to null for image_base64
    const imageValue = imageBase64 && imageBase64.trim() !== '' ? imageBase64 : null;
    
    await query(
      `UPDATE menu_items 
       SET name = $1, description = $2, category_id = $3, image_base64 = $4, is_available = $5, updated_at = $6
       WHERE id = $7`,
      [name, description, categoryId[0].id, imageValue, isAvailable, new Date(), itemId]
    );
    
    // Update tier associations - delete existing and insert new
    await query('DELETE FROM menu_item_tiers WHERE item_id = $1', [itemId]);
    
    if (tierIds && Array.isArray(tierIds) && tierIds.length > 0) {
      for (const tierId of tierIds) {
        const mitId = generateId();
        await query(
          'INSERT INTO menu_item_tiers (id, item_id, tier_id) VALUES ($1, $2, $3)',
          [mitId, itemId, tierId]
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Menu PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { itemId } = await request.json();
    
    await query(
      'UPDATE menu_items SET is_deleted = true, updated_at = $1 WHERE id = $2',
      [new Date(), itemId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Menu DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

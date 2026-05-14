import { createClient } from './supabase';

export const DynamicCollectionService = {
  /**
   * Synchronizes a dynamic collection from a promotion.
   * If the collection doesn't exist, it creates one.
   * If it exists, it updates metadata.
   */
  async syncFromPromotion(promotionId: string) {
    const supabase = createClient();

    // 1. Fetch promotion details
    const { data: promo, error: promoError } = await supabase
      .from('skin_promotions')
      .select('*')
      .eq('skin_id', promotionId)
      .single();

    if (promoError || !promo) {
      console.error('Error fetching promotion for sync:', promoError);
      return;
    }

    // 2. Generate slug from title if not exists
    const slug = promo.skin_title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // 3. Check if collection already exists for this promotion
    const { data: existingCol } = await supabase
      .from('skin_collections')
      .select('skin_id')
      .eq('skin_promotion_id', promotionId)
      .single();

    const collectionData = {
      skin_name: promo.skin_title,
      skin_slug: slug,
      skin_description: promo.skin_description || `Exclusive promotional collection: ${promo.skin_title}`,
      skin_promotion_id: promotionId,
      skin_is_dynamic: true,
      skin_is_active: promo.skin_is_active,
      skin_is_pinned: true, // Default to true for promotions
      skin_show_on_homepage: true,
      // We can add more defaults here
    };

    if (existingCol) {
      // Update
      await supabase
        .from('skin_collections')
        .update(collectionData)
        .eq('skin_id', existingCol.skin_id);
    } else {
      // Create
      await supabase
        .from('skin_collections')
        .insert(collectionData);
    }
  },

  /**
   * Deactivates or removes dynamic collections when an offer is deleted/expired.
   */
  async cleanup(promotionId: string) {
    const supabase = createClient();
    await supabase
      .from('skin_collections')
      .update({ skin_is_active: false })
      .eq('skin_promotion_id', promotionId);
  }
};

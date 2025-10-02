created_at

async findById(id: number, requestedFields: string[] = []): Promise<Property | null> {
  const includesAddress = requestedFields.includes('address') || requestedFields.some(f => f.startsWith('address.'));
  const includesImages = requestedFields.includes('images');
  const includesBookings = requestedFields.includes('bookings');
  const includesReviews = requestedFields.includes('reviews');

  const selectFields: string[] = ['p.*'];

  if (includesAddress) {
    selectFields.push(`
      COALESCE(
        json_build_object(
          'id', a.id,
          'street', a.street,
          'city', c.name,
          'country', co.name,
          'postal_code', a.postal_code,
          'latitude', a.latitude,
          'longitude', a.longitude
        ),
        '{}'::json
      ) AS address
    `);
  }

  if (includesImages) {
    selectFields.push(`
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', i.id,
          'property_id', i.property_id,
          'url', i.url,
          'meta_data', i.meta_data,
          'caption', i.caption
        )) FROM property_images i WHERE i.property_id = p.id),
        '[]'::json
      ) AS images
    `);
  }

  if (includesBookings) {
    selectFields.push(`
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', b.id,
          'property_id', b.property_id,
          'user_id', b.user_id,
          'start_date', b.start_date,
          'end_date', b.end_date,
          'status', b.status,
          'created_at', b.created_at
        )) FROM property_bookings b WHERE b.property_id = p.id),
        '[]'::json
      ) AS bookings
    `);
  }

  if (includesReviews) {
    selectFields.push(`
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', r.id,
          'property_id', r.property_id,
          'user_id', r.user_id,
          'rating', r.rating,
          'comment', r.comment,
          'created_at', r.created_at
        )) FROM property_reviews r WHERE r.property_id = p.id),
        '[]'::json
      ) AS reviews
    `);
  }

  const joins = includesAddress ? `
    LEFT JOIN addresses a ON p.address_id = a.id
    LEFT JOIN cities c ON a.city_id = c.id
    LEFT JOIN countries co ON c.country_id = co.id
  ` : '';

  const query = `
    SELECT ${selectFields.join(', ')}
    FROM properties p
    ${joins}
    WHERE p.id = $1
  `;

  const result = await this.pool.query(query, [id]);
  return result.rows[0] || null;
}
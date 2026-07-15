// src/classes/carouselItemClass.js
export class CarouselItem {
  constructor({
    id = null,
    imageUrl = '',
    imagePath = '',
    title = '',
    subtitle = '',
    link = '',
    order = 0,
    active = true,
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.imageUrl = imageUrl;
    this.imagePath = imagePath;
    this.title = title;
    this.subtitle = subtitle;
    this.link = link;
    this.order = order;
    this.active = active;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  toFirestore() {
    return {
      imageUrl: this.imageUrl,
      imagePath: this.imagePath || '',
      title: this.title,
      subtitle: this.subtitle,
      link: this.link,
      order: this.order,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new CarouselItem({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    });
  }
}
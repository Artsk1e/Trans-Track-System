// Abstract base classes from the class diagram:
// BaseEntity <- BaseAuditEntity <- domain entities

class BaseEntity {
  constructor(row = {}) {
    Object.assign(this, row);
  }

  getCreatedAt() {
    return this.created_at || null;
  }

  getUpdatedAt() {
    return this.updated_at || null;
  }
}

class BaseAuditEntity extends BaseEntity {
  getCreatedBy() {
    return this.created_by ?? null;
  }

  getUpdatedBy() {
    return this.updated_by ?? null;
  }
}

module.exports = { BaseEntity, BaseAuditEntity };

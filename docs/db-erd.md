# HopeCMS — Database ERD
## Sprint 1 | M3 SP1 PR Docs
> HOPE, INC

```mermaid
erDiagram
    customer {
        varchar custNo PK
        varchar custName
        varchar address
        varchar payterm
        varchar record_status
        varchar stamp
    }

    sales {
        varchar transNo PK
        date salesDate
        varchar custNo FK
        varchar empNo
    }

    salesdetail {
        varchar transNo FK
        varchar prodCode FK
        numeric quantity
    }

    product {
        varchar prodCode PK
        varchar description
        varchar unit
    }

    pricehist {
        date effdate PK
        varchar prodCode FK
        numeric unitprice
    }

    customer ||--o{ sales : "Pays"
    sales ||--|{ salesdetail : "Contains"
    product ||--|{ salesdetail : "Specifies"
    product ||--|{ pricehist : "List"
```

## Relationships
| Relationship |
|===|
| customer → sales |
| sales → salesdetail |
| product → salesdetail |
| product → pricehist |
const { EntitySchema } = require('typeorm');

const CreditPurchases = new EntitySchema ({
    name: 'CreditPurchases',
    tableName: 'credit_purchases',

    columns:{
        id:{
            type: 'uuid',
            primary: true,
            generated: 'uuid'
        },
        name: {
            type: 'varchar'
        },
        purchased_credits:{
            type: 'integer',
            nullable: false
        },
        price_paid:{
            type: 'numeric',
            precision: 10,
            scale: 2,
            nullable: false
        },
        purchase_at:{
            type: 'timestamptz',
            createDate: true
        },
    },
    relations:{
        users:{
            nullable: false,
            type: 'many-to-one',
            target: 'Users',
            joinColumn: {
                name: 'user_id',
            referencedColumnName: 'id',
        },
    },
        credit_Package:{
            nullable: false,
            type: 'many-to-one',
            target: 'Package',
            joinColumn :{
                name: 'credit_package_id',
                referencedColumnName: 'id',
            },
        },
    },
});


module.exports = CreditPurchases;
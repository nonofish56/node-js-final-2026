const  { EntitySchema } = require('typeorm');

const package = new EntitySchema ({
    name : 'Package',
    tableName : 'package',

    columns: {
        id : {
            type : 'uuid',
            primary : true,
            generated : "uuid"
        },
        name : {
            type : 'varchar',
            length : 50
        },
        credit_amount : {
            type : 'int'
        },
        price : {
            type : 'numeric',
            precision : 10,
            scale : 2
        },
        createdAt: {
                type: 'timestamp',
                createDate: true
        },
    }
});


module.exports = package;
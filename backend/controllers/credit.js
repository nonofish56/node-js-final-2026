//controller/credit

const { Repository } = require('typeorm');
const { dataSource } = require('../db/data-source');

const Package = require('../db/entities/Package.js');


const getPackage = async (req,res) => {
    const getData = await dataSource.getRepository(Package).find();
    
    return res.status(200).json({
        status: 'success',
        data: getData
    })
};

const postPackage = async (req,res) => {
    const dataBody = req.body;

    if(!dataBody || !dataBody.name || !dataBody.credit_amount ||!dataBody.price || typeof dataBody.name !== "string"){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    }if(dataBody.credit_amount <= 0 || !Number.isInteger(dataBody.credit_amount)){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
    })
    }if(dataBody.price <= 0 || !Number.isFinite(dataBody.price)){
        return res.status(400).json({
            status: "failed",
            message: "欄位未填寫正確"
        })
    }

    const packageRepo = dataSource.getRepository(Package);

    const checkData = await dataSource.getRepository(Package).findOne({
        where: {
            name: dataBody.name
        }
    })

    if(checkData){
        return res.status(409).json({
            status: "failed",
            message: "資料重複"
        })
    }

    const newPackage = await packageRepo.save(dataBody);
        return res.status(200).json({
            status: "success",
            data: newPackage
        })
}

module.exports = {
    getPackage,
    postPackage,
};






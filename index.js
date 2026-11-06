import express from 'express';
import pool from './db.js';

const app= express();
const PORT= 3000;

app.get('/eloadok', async (req,res) =>{
    const orszag= req.query.orszag;
    if(orszag==null)
    {
        let sql= "SELECT nev FROM eloadok ORDER BY nev";
        let [eredmeny] = await pool.query(sql);
        return res.json(eredmeny);
    }
    else{
        console.log(orszag);
        let sql= "SELECT nev FROM eloadok WHERE orszag = ?";
        let [eredmeny] = await pool.query(sql,[orszag]);
        return res.json(eredmeny);
    }
})
app.get('/eloadok/:id', async (req,res)=>{

    const eloadoid= req.params.id;
    let sql= "SELECT eloadok.nev, eloadok.orszag, eloadok.alapitas, albumok.cim, albumok.ev, albumok.mufaj, albumok.hossz FROM eloadok INNER JOIN albumok ON eloadok.id= albumok.eloado_id WHERE eloadok.id = ?";
    let [eredmeny] = await pool.query(sql, [eloadoid]);
    return res.json(eredmeny);
})

app.get('/albumok', async (req,res) =>{
    let mufaj= req.query.mufaj;
    let tol= req.query.tol;
    let ig= req.query.ig;
    let sqlwhere=[];
    sqlwhere.push("SELECT eloadok.nev, cim, ev FROM `albumok` INNER JOIN eloadok ON albumok.eloado_id = eloadok.id WHERE 1=1")
    let paramater=[];
    if(mufaj!= null){
        sqlwhere.push(" AND albumok.mufaj = ?");
        paramater.push(mufaj);
    }
    if(tol!= null){
        sqlwhere.push(" AND albumok.ev >= ?");
        paramater.push(tol);
    }
    if(ig!= null){
        sqlwhere.push(" AND albumok.ev <= ?");
        paramater.push(ig);
    }
    sqlwhere.push(" ORDER BY albumok.ev, albumok.cim")
    let mainsql =sqlwhere.join("");
    console.log(mainsql);
    let [eredmeny]= await pool.query(mainsql,paramater)
    res.json(eredmeny);
})

app.get('/albumok/kereses', async (req,res)=>{
    let szuro= req.query.q;
    if(szuro.length<=1){
        return res.status(400);
    }
    let sql= "SELECT albumok.cim, eloadok.nev FROM eloadok INNER JOIN albumok ON eloadok.id= albumok.eloado_id WHERE albumok.cim LIKE '%era%' OR eloadok.nev LIKE '%era%'";
    let[eredmeny]= await pool.query(sql,[szuro]);
    res.json(eredmeny);
})

app.get('/mufajok',async (req,res) =>{
    let sql= "SELECT mufaj, COUNT(id) AS albumdb, SUM(hossz) AS osszhossz FROM albumok GROUP BY mufaj";
    let[eredmeny] = await pool.query(sql);
    res.json(eredmeny);
})

app.get('/statisztika/eloadok',async (req,res)=>{
    let sql="SELECT eloadok.nev, COUNT(*)AS albumdb, MIN(albumok.ev)AS legrégebbialbum, MAX(albumok.ev) AS legújabbalbum FROM eloadok INNER JOIN albumok ON eloadok.id=albumok.eloado_id GROUP BY eloadok.nev";
    let [eredmeny]= await pool.query(sql);
    res.json(eredmeny);
})

app.get('/orszagok', async(req,res)=>{
    let sql= "SELECT eloadok.orszag, COUNT(eloadok.id) AS eloadodb, COUNT (albumok.id) AS albumdb FROM eloadok INNER JOIN albumok ON eloadok.id = albumok.eloado_id GROUP BY eloadok.orszag";
    let [eredmeny]= await pool.query(sql);
    res.json(eredmeny);
})



app.listen(PORT, () => console.log(`Szerver fut: http://localhost:${PORT}`));
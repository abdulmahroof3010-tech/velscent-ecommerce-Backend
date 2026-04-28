const validate=(Schema)=>(req,res,next)=>{
    const  isDone=Schema.safeParse(req.body);

    if(!isDone.success){
        console.log(isDone.error)

        return res.status(400).json({
            errors:isDone.error.errors
        });
    }
    
    req.body=isDone.data;
    next();

};

module.exports={validate}
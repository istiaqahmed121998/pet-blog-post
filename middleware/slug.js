module.exports.slugUrl=((title)=>{
    var today = new Date();
    let countle=0;
    let url="";
    title.split(' ').forEach((x)=>{
        if(countle<25){
            url+=x.toLowerCase()+'/';
            countle+=x.length;
        }
        else return;
    });
    today =  today.getFullYear()+'/'+String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0') + '/';
    return (today+url);
})
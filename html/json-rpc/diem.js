function add(a,b) {
    return a+b;
}

//---------------------------------------------------------
// exports
 
module.exports=new function() {
    this.add = add;
};
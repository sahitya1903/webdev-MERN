const student={
    name: 'sahitya',
    marks: 95,
    prop: this, //global scope = window object
    getName: function(){
        console.log(this);  //this= student object
        return this.name;
    },
    getMarks: ()=>{
        console.log(this);    //this = parent's scope = window object
        return this.marks;  //lexical scope
    },
    getInfo1: function(){
        setTimeout(()=>{
            console.log("Apna College");
        },2000);
    },
    getInfo2: function(){
        setTimeout(function(){
            console.log("Apna College");
        },2000);
    }
}

console.log(student.getName());
console.log(student.getMarks());
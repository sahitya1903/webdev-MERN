const student={
    name: "sahitya",
    age: 22,
    eng: 95,
    math: 97,
    phy: 97,

    getAvg(){
        console.log(this);
        let avg=(this.eng+this.math+this.phy)/3;
        console.log(`${this.name} got avg marks: ${avg}`);
    }
}

console.log(student.getAvg());

function getAvg(){
    console.log(this);      //output is window object
}

getAvg();

try{
    console.log(a);
}catch(e){
    console.log("Undeclared Variable");
    console.log(e);    
}finally{
    console.log("Exception Handler Closed")
}

const sum=(a,b)=>{      //Arrow Function
    return a+b;
}

console.log(sum(2,3));

const cube= n=>{       //(For single argument, () can be skipped)
    console.log(n*n*n);
}

cube(5);

const mul=(a,b)=>(a*b); //Implicit return using Arrow Function
console.log(mul(5,3));

const div=(a,b)=>a/b; // () can be skipped
console.log(div(5,2));

const square=n=>n*n;
console.log(square(5));


console.log("Hi, there!");

setTimeout( ()=>{
    console.log("Apna College");
},4000);

console.log("Welcome to ");

let id=setInterval( ()=>{
    console.log("Agra");
},2000);

setTimeout(()=>clearInterval(id),4000);

const student2={
    name: 'sahitya',
    marks: 95,
    prop: this, //global scope = window object
    getName: function(){
        console.log(this);  //this= student object
        return this.name;
    },
    getMarks: ()=>{
        console.log(this);    //this = parent's scope = window object(lexical scope)
        return this.marks;  // undefined for window object
    },
    getInfo1: function(){
        setTimeout(()=>{
            console.log(this);      //student 
        },2000);
    },
    getInfo2: function(){
        setTimeout(function(){
            console.log(this);      //window
        },2000);
    }
}

console.log(student2.getName());
console.log(student2.getMarks());
student2.getInfo1();
student2.getInfo2();



let id2= setInterval(()=>console.log("Hello World"),2000);
setTimeout(()=>{
    clearInterval(id2),
    console.log("Cleared Interval");
},10000);
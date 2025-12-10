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



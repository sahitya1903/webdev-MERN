let sum=64; //Global Scope

function calSum(a,b){
    let sum=a+b;        //Function Scope
    console.log(sum);
}

calSum(2,3);

console.log(sum);


{
    let a=5;
}

// console.log(a);     //Block Scope

for(let i=0;i<5;i++){
    console.log(i);
}

// console.log(i);     //Block Scope

function outerFunc(){
    let x=1;
    let y=2;
    function innerFunc(){       //Function Scope
        console.log(x);     //Lexical Scope
        console.log(y);
    }

    innerFunc();
}

outerFunc();



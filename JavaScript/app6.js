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

let product=function(a,b){      //Anonymous Function or Function Expression
    return a*b;
}

console.log(product);
console.log(product(2,5));

product=function(a,b){      //Update function expression
    return `Product: ${a*b}`;
}

console.log(product);
console.log(product(2,5));


function multipleGreet(func,n){     //Higher Order Function
    for(let i=0;i<n;i++){
        func();
    }
}

let greet=function(){
    console.log("hello");
}

multipleGreet(greet,2);

function oddEvenTest(request){  //Factory function (Returns a function)
    if(request=="odd"){
        return function(n){
            console.log(n%2!=0);
        }
    }else if(request=="even"){
        return function(n){
            console.log(n%2==0);
        }
    }else{
        console.log("Wrong Request");
    }
}


let func=oddEvenTest("odd");
console.log(func);
func(6);


const calculator={          //Methos
    add: function(a,b){
        return a+b;
    },
    sub: function(a,b){
        return a-b;
    },
    mul: function(a,b){
        return a*b;
    }
};

console.log(calculator);
console.log(calculator.add);
console.log(calculator["add"]);
console.log(calculator.add(2,3));


const calculator2={     //Shortcut Way for writing method
    add(a,b){
        return a+b;
    },
    sub(a,b){
        return a-b;
    },
    mul(a,b){
        return a*b;
    }
};

console.log(calculator2);
console.log(calculator2.mul);
console.log(calculator2["mul"]);
console.log(calculator2.mul(2,3));
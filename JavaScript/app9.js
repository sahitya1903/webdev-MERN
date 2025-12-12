//Default Parameter

function func(a,b=2){
    console.log(`a=${a}, b=${b}`);
}

func(2);
func(3,5);

let sum=function(a,b){
    return a+b;
}

console.log(sum(1));        //Only one arg -> output= not a number (NaN) 

//Spread


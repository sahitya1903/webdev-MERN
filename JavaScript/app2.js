let nums=[2,4,6,8];
console.log(nums);
console.log(nums[2]);
console.log(typeof nums);

let mix=[1,"Sahitya",9.26];
console.log(mix);
console.log(mix.length);
console.log(mix[1]);
console.log(mix[1][3]);

mix[2]=8.57;
console.log(mix); //arrays are mutable

mix[5]=0;
console.log(mix);
console.log(mix.length);


mix.pop();
console.log(mix);

mix.push("A");
console.log(mix);

mix.shift();
console.log(mix); 

mix.unshift(0);
console.log(mix);


let color=["red","yellow","green","blue","white"];
console.log(color.indexOf('yellow'));
console.log(color.indexOf('Yellow'));
console.log(color.includes('yellow'));
console.log(color.includes('Yellow'));

console.log(color.reverse()); //changes original array

let sum=color.concat(mix);
console.log(sum);
let sum2=mix.concat(color);
console.log(sum2);

console.log(color.slice(1));
console.log(color.slice(5));
console.log(color.slice());
console.log(color.slice(1,4));
console.log(color.slice(-3));

let cars=['bmw','xuv','maruti','audi'];
console.log(cars);
cars.splice(1,2);
console.log(cars);
cars.push("toyota");
cars.push("ferrari");
cars.push("mercedes");
cars.push("xuv");
console.log(cars);
cars.splice(2,3,"rollsroyce","porsche","lamborghini");
console.log(cars);
cars.splice(1,0,"maruti");
console.log(cars);

let num=[100,45,23,56,27];
num.sort();
console.log(num);
let char=['a','d','c','z','v'];
char.sort();
console.log(char);

let arr1=[1];
let arr2=[1];
console.log(arr1==arr2);
console.log(arr1===arr2);  //arr1 and arr2, same value different address, so no connection

let arr3=arr1;
console.log(arr3==arr1);
console.log(arr3===arr1); //arr1 and arr3, same value and address, so connected
arr1.pop();
console.log(arr3);

const arr=[1,2,3];
arr.push(0);
console.log(arr);

let nest=[[1,2,3],[4,5,6],[7,8,9]];
console.log(nest);
console.log(nest[1][2])

let tic=[['x',null,'o'],[null,'x',null],['o',null,'x']];
console.log(tic);
tic[0][1]='o';
console.log(tic);
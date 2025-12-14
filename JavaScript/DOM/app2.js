//classList property
let img=document.querySelector('img');
console.log(img.classList);

let heading=document.querySelector('h1');
console.log(heading.classList);
heading.classList.add('green');
heading.classList.add('underline');
heading.setAttribute('class','red');    //removes all class names, sets to red

heading.classList.remove('red');
heading.classList.add('green');
console.log(heading.classList.contains('red'));
console.log(heading.classList.contains('green'));

heading.classList.toggle('green');          //removes class green
console.log(heading.classList.contains('green'));

heading.classList.toggle('underline');         //adds class underline
console.log(heading.classList.contains('underline'));

heading.classList.toggle('green');          //adds class green
console.log(heading.classList.contains('green'));

console.log(heading.classList);


let box=document.querySelector('.box');
console.log(box.classList);
box.classList.add('yellowBg');
console.log(box.classList);


//Navigation on page

let h4=document.querySelector('h4');
console.dir(h4.parentElement);
console.dir(h4.children);

console.dir(box.parentElement);
console.dir(box.children);

let ul=document.querySelector('ul');
console.dir(ul.parentElement);
console.dir(ul.children);
console.dir(ul.previousElementSibling);
console.dir(ul.nextElementSibling);

img.previousElementSibling.style.color='red'; 

//Adding element on page
let btn=document.createElement('button');
let btn2=document.createElement('button');

console.dir(btn);
btn.innerText="Click Me";
btn2.innerText="Do not Click Me";


box.appendChild(btn);
box.append("Hello, modified paragraph 1 here");
box.append(btn);

box.prepend("Hello, modified paragraph 2 here");
box.prepend(btn2);

let btn3=document.createElement('button');
btn3.innerText="Button 3";
box.insertAdjacentElement('beforebegin',btn3);
box.insertAdjacentElement('afterbegin',btn3);
box.insertAdjacentElement('beforeend',btn3);
box.insertAdjacentElement('afterend',btn3);

//Removing element on Page
let body=document.querySelector('body');
body.removeChild(btn3);     //btn3 is child of body

btn.remove();   //direct removal

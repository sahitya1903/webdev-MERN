let p=document.createElement('p');
p.innerText="Hey I'm red";
p.classList.add('red');

let h3=document.createElement('h3');
h3.innerText="I'm blue h3";
h3.classList.add('blue');

let h1=document.createElement('h1');
h1.innerText="I'm in a div";

let p2=document.createElement('p');
p2.innerText="ME TOO";

let div=document.createElement('div');
div.append(h1,p2);
div.classList.add('box');

let body=document.querySelector('body');
body.append(p,h3,div);
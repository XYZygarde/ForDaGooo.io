const burger = document.getElementById("burger-icon");
const nav = document.querySelector('.nav-con');
const navLinks = document.querySelectorAll('.nav-con li');
const titleHide = document.querySelector('.navbar img');

document.addEventListener('DOMContentLoaded', () => {
    const navSlide = () => {
    
        if (burger && nav && navLinks) {
            burger.addEventListener('click', () => {
                burger.classList.toggle('fixing-burger');
                nav.classList.toggle('fixing-nav');
                titleHide.classList.toggle('fixing-logo');
                navLinks.forEach((link, index) => {
                    if (link.style.animation) {
                        link.style.animation ='';
                    } else {
                        link.style.animation = `showNavs 1s ease forwards ${index / 7 + 0}s`;
                    }
                });             
            });
        } else {
            console.error('One or more elements not found in the DOM');
        }
    };

    navSlide();

 
});

//link redirect 

document.getElementById("appDirect").addEventListener('click',()=>{
   window.location.href = "https://xyzygarde.github.io/ForDagooo.net/ForDaGo/fordago.html";
});
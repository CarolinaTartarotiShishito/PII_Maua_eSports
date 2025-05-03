let prevScrollPos = window.pageYOffset;
        const navbar = document.getElementById("navbar");

        window.onscroll = function() {
            const currentScrollPos = window.pageYOffset;
            if (prevScrollPos > currentScrollPos) {
                navbar.style.top = "0";
            } else {
                navbar.style.top = "-70px";
            }
            prevScrollPos = currentScrollPos;
        };
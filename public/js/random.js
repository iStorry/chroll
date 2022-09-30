$(function () {
    // Load Tems
    $.fn.temtems = async function () {
        return await $.get(`https://tem.team/api/v1/temtems?include=can_evolve&origin=churoll`);
    }

    const items = document.querySelectorAll('.item');
    document.querySelector('#spinner').addEventListener('click', spin);

    let images = []

    function preloadImages(array) {
        if (!preloadImages.list) {
            preloadImages.list = [];
        }
        var list = preloadImages.list;
        for (var i = 0; i < array.length; i++) {
            var img = new Image();
            img.onload = function () {
                var index = list.indexOf(this);
                if (index !== -1) {
                    // remove image from the array once it's loaded
                    // for memory consumption reasons
                    list.splice(index, 1);
                }
            }
            list.push(img);
            img.src = array[i];
        }
    }

    function init(firstInit = true, groups = 1, duration = 1) {
        for (const item of items) {
            if (firstInit) {
                item.dataset.spinned = '0';
            } else if (item.dataset.spinned === '1') {
                return;
            }

            const boxes = item.querySelector('.temtems');
            const boxesClone = boxes.cloneNode(false);
            const pool = ['https://temteam.sfo2.digitaloceanspaces.com/images/temtem/regular/069.png'];
            if (!firstInit) {
                const arr = [];
                for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
                    arr.push(...images);
                }
                pool.push(...shuffle(arr));
                boxesClone.addEventListener(
                    'transitionstart',
                    function () {
                        item.dataset.spinned = '1';
                        this.querySelectorAll('.box').forEach((box) => {
                            // box.style.filter = 'blur(1px)';
                        });
                    }, {
                        once: true
                    }
                );

                boxesClone.addEventListener(
                    'transitionend',
                    function () {
                        this.querySelectorAll('.box').forEach((box, index) => {
                            // box.style.filter = 'blur(0)';
                            if (index > 0) this.removeChild(box);
                        });
                    }, {
                        once: true
                    }
                );
            }

            for (let i = pool.length - 1; i >= 0; i--) {
                const box = document.createElement('div');
                box.classList.add('box');
                box.style.width = item.clientWidth + 'px';
                box.style.height = item.clientHeight + 'px';
                box.innerHTML = `<img src="${pool[i]}" alt="${i}" class="img-fluid">`
                boxesClone.appendChild(box);
            }
            boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
            boxesClone.style.transform = `translateY(-${item.clientHeight * (pool.length - 1)}px)`;
            item.replaceChild(boxesClone, boxes);
        }
    }

    const fetch = async () => {
        const exclude_temtems = [
            2, 4, 5, 7, 8, 10, 14, 16, 17, 19,
            21, 23, 25, 27, 29, 32, 33, 35, 37,
            39, 40, 42, 44, 46, 48, 51, 55, 57,
            60, 62, 64, 66, 67, 70, 72, 73, 76,
            79, 81, 82, 84, 86, 88, 90, 92, 93,
            97, 100, 102, 103, 105, 107, 109,
            111, 113, 117, 119, 120, 125, 127,
            130, 138, 139, 143, 145, 147, 150,
            151, 159, 161
        ]
        const {
            data: {
                temtems
            }
        } = await $(this).temtems();
        const lists = temtems.filter(k => !exclude_temtems.includes(k.number));
        images = lists.map(k => `https://temteam.sfo2.digitaloceanspaces.com/images/temtem/regular/${k.number.toString().padStart(3, "0")}.png`);
        init(true, 1, 1);
    };

    fetch();



    async function spin() {
        init(false, 1, 2);

        for (const item of items) {
            const boxes = item.querySelector('.temtems');
            const duration = parseInt(boxes.style.transitionDuration);
            boxes.style.transform = 'translateY(0)';
            await new Promise((resolve) => setTimeout(resolve, duration * 100));
        }
    }

    function shuffle([...arr]) {
        let m = arr.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);
            [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        return arr;
    }



});
(async function () {
    const container = document.querySelector(".container");

    let windowWidth = null;
    let paletteIndex = 0;
    let padding = 2;
    let number = "pi";
    let digitsStr = "";
    let customPalette = null;
    let renderType = "number";

    const font = [
        0b111101101101111, 0b110010010010111, 0b111001111100111,
        0b111001111001111, 0b101101111001001, 0b111100111001111,
        0b111100111101111, 0b111001001001001, 0b111101111101111,
        0b111101111001111,
    ];

    const palettes = [
        [
            [0x1f, 0x77, 0xb4],
            [0xff, 0x7f, 0x0e],
            [0x2c, 0xa0, 0x2c],
            [0xd6, 0x27, 0x28],
            [0x94, 0x67, 0xbd],
            [0x8c, 0x56, 0x4b],
            [0xe3, 0x77, 0xc2],
            [0x7f, 0x7f, 0x7f],
            [0xbc, 0xbd, 0x22],
            [0x17, 0xbe, 0xcf],
        ],
        [
            [165, 0, 38],
            [215, 48, 39],
            [244, 109, 67],
            [253, 174, 97],
            [254, 224, 144],
            [224, 243, 248],
            [171, 217, 233],
            [116, 173, 209],
            [69, 117, 180],
            [49, 54, 149],
        ],
        [
            [110, 64, 170],
            [150, 61, 179],
            [191, 60, 175],
            [228, 65, 157],
            [254, 75, 131],
            [255, 94, 99],
            [255, 120, 71],
            [251, 150, 51],
            [226, 183, 47],
            [198, 214, 60],
        ],

        [
            [35, 23, 27],
            [74, 88, 221],
            [47, 157, 245],
            [39, 215, 196],
            [77, 248, 132],
            [149, 251, 81],
            [222, 221, 50],
            [255, 164, 35],
            [246, 95, 24],
            [186, 34, 8],
        ],
        [
            [110, 64, 170],
            [191, 60, 175],
            [254, 75, 131],
            [255, 120, 71],
            [226, 183, 47],
            [175, 240, 91],
            [82, 246, 103],
            [29, 223, 163],
            [35, 171, 216],
            [76, 110, 219],
        ],
        [
            [255, 64, 64],
            [231, 141, 11],
            [167, 213, 3],
            [88, 252, 42],
            [24, 244, 114],
            [0, 191, 191],
            [24, 114, 244],
            [88, 42, 252],
            [167, 3, 213],
            [231, 11, 141],
        ],
        [
            [247, 251, 255],
            [227, 238, 249],
            [207, 225, 242],
            [181, 212, 233],
            [147, 195, 223],
            [109, 174, 213],
            [75, 151, 201],
            [47, 126, 188],
            [24, 100, 170],
            [10, 74, 144],
        ],
        [
            [10, 74, 144],
            [24, 100, 170],
            [47, 126, 188],
            [75, 151, 201],
            [109, 174, 213],
            [147, 195, 223],
            [181, 212, 233],
            [207, 225, 242],
            [227, 238, 249],
            [247, 251, 255],
        ],
    ];

    function render() {
        const start = Date.now();
        windowWidth = container.getBoundingClientRect().width;
        container.innerHTML = "";

        const palette = customPalette || palettes[paletteIndex];

        const digitWidth = 3 + padding;
        const digitHeight = 5 + padding;

        // Need to handle restricions on canvas size, ensure it is a multiple
        // of digitHeight
        const maxCanvasHeight = Math.floor(10000 / digitHeight) * digitHeight;

        const xDigits = Math.floor(windowWidth / digitWidth);
        const width = xDigits * digitWidth;

        const overallYDigits = Math.ceil(digitsStr.length / xDigits);
        const overallHeight = overallYDigits * digitHeight;

        const canvasses = Math.ceil(overallHeight / maxCanvasHeight);

        for (let ci = 0; ci < canvasses; ci++) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const maxNumbersPerCanvas =
                (maxCanvasHeight / digitHeight) * xDigits;

            const lowerBound = ci * maxNumbersPerCanvas;
            const numbers = digitsStr.slice(
                lowerBound,
                lowerBound + maxNumbersPerCanvas
            );

            const yDigits = Math.ceil(numbers.length / xDigits);
            const height = yDigits * digitHeight;
            canvas.width = width;
            canvas.height = height;

            let i = numbers.length;

            const imageData = ctx.createImageData(width, height);

            while (i--) {
                const numStr = numbers[i];
                const num = parseInt(numStr, 10);
                const char = font[num];
                const color = palette[num];

                const colIndex = i % xDigits;
                const rowIndex = Math.floor(i / xDigits);

                const x0 = colIndex * digitWidth;
                const y0 = rowIndex * digitHeight + 1;

                if (renderType === "block") {
                    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                    ctx.fillRect(
                        x0,
                        y0,
                        digitWidth - padding,
                        digitHeight - padding
                    );

                    continue;
                }

                // 5th row, 3rd pixel
                if (Boolean(char & (1 << 0))) {
                    const p = (y0 - 1 + 4) * width * 4 + (x0 + 2) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 5th row, 2nd pixel
                if (Boolean(char & (1 << 1))) {
                    const p = (y0 - 1 + 4) * width * 4 + (x0 + 1) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 5th row, 1st pixel
                if (Boolean(char & (1 << 2))) {
                    const p = (y0 - 1 + 4) * width * 4 + (x0 + 0) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 4th row, 3rd pixel
                if (Boolean(char & (1 << 3))) {
                    const p = (y0 - 1 + 3) * width * 4 + (x0 + 2) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 4th row, 2nd pixel
                if (Boolean(char & (1 << 4))) {
                    const p = (y0 - 1 + 3) * width * 4 + (x0 + 1) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 4th row, 1st pixel
                if (Boolean(char & (1 << 5))) {
                    const p = (y0 - 1 + 3) * width * 4 + (x0 + 0) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 3rd row, 3rd pixel
                if (Boolean(char & (1 << 6))) {
                    const p = (y0 - 1 + 2) * width * 4 + (x0 + 2) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 3rd row, 2nd pixel
                if (Boolean(char & (1 << 7))) {
                    const p = (y0 - 1 + 2) * width * 4 + (x0 + 1) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 3rd row, 1st pixel
                if (Boolean(char & (1 << 8))) {
                    const p = (y0 - 1 + 2) * width * 4 + (x0 + 0) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 2nd row, 3rd pixel
                if (Boolean(char & (1 << 9))) {
                    const p = (y0 - 1 + 1) * width * 4 + (x0 + 2) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 2nd row, 2nd pixel
                if (Boolean(char & (1 << 10))) {
                    const p = (y0 - 1 + 1) * width * 4 + (x0 + 1) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 2nd row, 1st pixel
                if (Boolean(char & (1 << 11))) {
                    const p = (y0 - 1 + 1) * width * 4 + (x0 + 0) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 1st row, 3rd pixel
                if (Boolean(char & (1 << 12))) {
                    const p = (y0 - 1 + 0) * width * 4 + (x0 + 2) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 1st row, 2nd pixel
                if (Boolean(char & (1 << 13))) {
                    const p = (y0 - 1 + 0) * width * 4 + (x0 + 1) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }

                // 1st row, 1st pixel
                if (Boolean(char & (1 << 14))) {
                    const p = (y0 - 1 + 0) * width * 4 + (x0 + 0) * 4;
                    imageData.data[p + 0] = color[0];
                    imageData.data[p + 1] = color[1];
                    imageData.data[p + 2] = color[2];
                    imageData.data[p + 3] = 255;
                }
            }

            if (renderType === "number") {
                ctx.putImageData(imageData, 0, 0);
            }

            container.appendChild(canvas);
        }

        console.log(`Rendering took: ${Date.now() - start}ms`);
    }

    function renderPalettes() {
        const container = document.querySelector(".paletteList");
        palettes.forEach((palette, pIndex) => {
            const paletteContainer = document.createElement("div");
            paletteContainer.className = "paletteContainer";

            palette.forEach((color, colorIndex) => {
                const colorElem = document.createElement("div");
                colorElem.style.background = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                colorElem.textContent = colorIndex;
                paletteContainer.appendChild(colorElem);
            });

            paletteContainer.addEventListener("click", (e) => {
                e.preventDefault();
                paletteIndex = pIndex;
                customPalette = null;
                document
                    .querySelectorAll(".paletteContainer")
                    .forEach((el) => el.classList.remove("active"));
                paletteContainer.classList.add("active");
                render();
            });

            if (pIndex === 0) paletteContainer.classList.add("active");

            container.appendChild(paletteContainer);
        });
    }

    async function bindEvents() {
        const paddingElem = document.querySelector(".paddingControl");
        paddingElem.value = padding;
        paddingElem.addEventListener("change", (e) => {
            padding = parseInt(e.target.value);
            render();
        });

        let resizeTimeout;
        window.addEventListener("resize", () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                render();
            }, 300);
        });

        document.querySelector(".lightTheme").addEventListener("click", () => {
            document.body.classList.add("light");
            document.body.classList.remove("dark");
            document.querySelector(".lightTheme").classList.add("active");
            document.querySelector(".darkTheme").classList.remove("active");
        });

        document.querySelector(".darkTheme").addEventListener("click", () => {
            document.body.classList.add("dark");
            document.body.classList.remove("light");
            document.querySelector(".lightTheme").classList.remove("active");
            document.querySelector(".darkTheme").classList.add("active");
        });

        document
            .querySelector(".renderNumber")
            .addEventListener("click", () => {
                renderType = "number";
                document.querySelector(".renderNumber").classList.add("active");
                document
                    .querySelector(".renderBlock")
                    .classList.remove("active");
                render();
            });

        document.querySelector(".renderBlock").addEventListener("click", () => {
            renderType = "block";
            document.querySelector(".renderNumber").classList.remove("active");
            document.querySelector(".renderBlock").classList.add("active");
            render();
        });

        document.querySelectorAll(".customColorPicker").forEach((el) => {
            el.addEventListener("change", () => {
                let paletteStrs = [];
                document
                    .querySelectorAll(".customColorPicker")
                    .forEach((ii) => paletteStrs.push(ii.value));

                customPalette = paletteStrs.map((str) => {
                    const rr = str.slice(1, 3);
                    const gg = str.slice(3, 5);
                    const bb = str.slice(5, 7);
                    const r = parseInt(rr, 16);
                    const g = parseInt(gg, 16);
                    const b = parseInt(bb, 16);
                    return [r, g, b];
                });

                document
                    .querySelectorAll(".paletteContainer")
                    .forEach((el) => el.classList.remove("active"));

                render();
            });
        });

        async function fetchdata() {
            const digitsResp = await fetch(`/${number}.txt`);
            digitsStr = await digitsResp.text();
        }

        document
            .querySelectorAll(".numberSelect > div")
            .forEach((el, index) => {
                if (el.dataset.value === number) {
                    el.classList.add("active");
                }

                el.addEventListener("click", async () => {
                    document
                        .querySelectorAll(".numberSelect > div")
                        .forEach((el) => el.classList.remove("active"));
                    el.classList.add("active");
                    number = el.dataset.value;
                    await fetchdata();
                    render();
                });
            });
        await fetchdata();
    }

    renderPalettes();
    await bindEvents();
    render();
})().catch((err) => console.error(err));

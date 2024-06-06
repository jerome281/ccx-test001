(function () {
  // Test Config
  const DEBUG = false; // Set this to false to disable debug messages
  const TEST_NAME = 'ccx-test001'; // Test name for identification purposes
  const TEST_HOST = 'direct.asda.com';
  let testLoaded = false; // Flag to ensure the test is loaded only once

  // CSS to be injected
  const css = `
      .ccx-test001 .image-slider-container .sidebar-wrapper {
        display: none;
      }
      .ccx-test001 .product-image-slider-wrap {
        gap: 5px;
        width: calc(100% - 298px);
        display: flex;
      }
      .ccx-test001 .product-image-slider-wrap .swiper-button-prev {
        margin-left: 14px;
      }
      .ccx-test001 .side-panel {
        flex-direction: column;
        gap: 40px;
        width: 155px;
        display: flex;
      }
      .ccx-test001 .side-panel .icon-zoom-in {
        cursor: pointer;
        margin-top: auto;
      }
      .ccx-test001 .side-panel .icon-zoom-in .icon-text {
        display: none;
      }
      .ccx-test001 .side-panel__container {
        border-right: 1px solid #cbcbcb;
        margin-top: 4px;
        margin-right: 30px;
        padding-right: 10px;
      }
      .ccx-test001 .side-panel__thumbnails .swiper-wrapper {
        flex-direction: column;
        gap: 8px;
        display: flex;
      }
      .ccx-test001 .side-panel__thumbnails .swiper-wrapper .swiper-slide.active .product__image {
        border-color: #191919;
      }
      .ccx-test001 .side-panel__thumbnails .swiper-wrapper .swiper-slide .product__image {
        cursor: pointer;
      }
      .ccx-test001 .side-panel__thumbnails .swiper-wrapper .swiper-slide .product__image img {
        width: 100%;
      }
    `;

  // Logging function that outputs the provided message if DEBUG is true
  const log = (message) => {
    if (DEBUG) {
      console.log(`DEBUG: ${message}`);
    }
  };

  // Returns a promise when an element is injected into the page
  const waitForElement = (element) => {
    return new Promise((resolve, reject) => {
      // Options for the observer (which mutations to observe)
      const config = { attributes: false, childList: true, subtree: true };

      // Callback function to execute when mutations are observed
      const callback = function (mutationsList, observer) {
        const target = document.querySelector(element);
        if (target) {
          log(`*** ${element} found ***`);
          observer.disconnect();
          resolve(target);
        }
      };

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(callback);

      // Start observing the document for configured mutations
      observer.observe(document, config);
    });
  };

  const injectCSS = (css) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  };

  const newSidePanel = () => {
    waitForElement('.image-slider-container').then(() => {
      document.body.classList.add(TEST_NAME); // Add the test name to the body class
      log(`Running Test ${TEST_NAME}`);
      log('*** excessChanges ***');

      const checkImageSlider = document.querySelector(
        '.image-slider-container'
      );
      if (checkImageSlider) {
        // Clone this .modal-slider-mini element
        const thumbnailsElement = document.querySelector(
          '.modal-slider-mini .swiper-wrapper'
        );
        let thumbnails = '';
        if (thumbnailsElement) {
          thumbnails = thumbnailsElement.outerHTML;
        }

        // Select the product__image-slider element
        const productImageSlider = document.querySelector(
          '.image-slider-container .relative-container'
        );

        // Create the new wrapper div around the main image slider
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('product-image-slider-wrap');

        // Create the side panel
        const sidePanel = document.createElement('div');
        sidePanel.classList.add('side-panel');
        sidePanel.innerHTML = `
                <div class="side-panel__container">
                  <div class="side-panel__thumbnails">
                    ${thumbnails}
                  </div>
                </div>
              `;

        // Insert the product__image-slider into the new wrapper
        if (productImageSlider && productImageSlider.parentNode) {
          productImageSlider.parentNode.insertBefore(
            wrapperDiv,
            productImageSlider
          );

          // Move the side panel into the new wrapper
          wrapperDiv.appendChild(sidePanel);

          // Move the product__image-slider into the new wrapper
          wrapperDiv.appendChild(productImageSlider);
        }

        // Move element .icon-zoom-in into the new .side-panel
        const zoomInIcon = document.querySelector('.icon-zoom-in');
        if (zoomInIcon) {
          const sidePanel = document.querySelector('.side-panel');
          sidePanel.appendChild(zoomInIcon);
        }

        // Logic to keep in sync the main image slider with the side panel thumbnails //

        // Set the first side panel thumbnail as active on load
        const firstThumbnail = document.querySelector(
          '.side-panel__thumbnails .swiper-slide'
        );
        if (firstThumbnail) {
          firstThumbnail.classList.add('active');
        }

        // Select all the pagination bullets
        const bulletsPagination = document.querySelectorAll(
          '.swiper-pagination-bullet'
        );
        // Select all the side panel thumbnails
        const sidePanelThumbnails = document.querySelectorAll(
          '.side-panel__thumbnails .swiper-wrapper .swiper-slide'
        );

        // Loop through the sidePanelThumbnails and add click event listeners
        sidePanelThumbnails.forEach((thumbnail, index) => {
          thumbnail.addEventListener('click', () => {
            bulletsPagination[index].click();
          });
        });

        // MutationObserver instance to observe navigation active class changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            // Check if the mutation is a class change
            if (
              mutation.type === 'attributes' &&
              mutation.attributeName === 'class'
            ) {
              // Check if the class .swiper-pagination-bullet-active is added or removed
              const isActive = mutation.target.classList.contains(
                'swiper-pagination-bullet-active'
              );
              const index = Array.from(bulletsPagination).indexOf(
                mutation.target
              );

              if (isActive) {
                // Do something when the class .swiper-pagination-bullet-active is added
                if (index !== -1) {
                  // Match with sidePanelThumbnails
                  sidePanelThumbnails[index].classList.add('active');
                }
              } else {
                // Do something when the class .swiper-pagination-bullet-active is removed
                if (index !== -1) {
                  // Match with sidePanelThumbnails
                  sidePanelThumbnails[index].classList.remove('active');
                }
              }
            }
          });
        });

        // Configure the observer to watch for changes in attributes
        const observerConfig = {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: ['class'],
        };

        // Start observing the target nodes for configured mutations
        bulletsPagination.forEach((bullet) => {
          observer.observe(bullet, observerConfig);
        });
      }
    });
  };

  // Function to load the test if the pathname matches and the test is not already loaded
  const loadTest = () => {
    if (
      window.innerWidth >= 600 &&
      window.location.hostname === TEST_HOST &&
      !testLoaded
    ) {
      testLoaded = true;
      injectCSS(css);
      newSidePanel();
    }
  };
  loadTest();
})();

import { createClient } from "https://esm.sh/@sanity/client";
import imageUrlBuilder from "https://esm.sh/@sanity/image-url";

const sanityClient = createClient({
  projectId: "4ie5mdlg",
  dataset: "production",
  useCdn: true,
  apiVersion: "v2022-03-07",
});

// Create an instance of the image URL builder
const builder = imageUrlBuilder(sanityClient);

// Helper function to generate image URLs
function urlFor(source) {
  return builder.image(source);
}

// Fetch projects from Sanity
sanityClient
  .fetch(
    `
  *[_type == "project" && featured ] | order(_createdAt asc){
    projectname,
    slug,
    client,
    location,
    testimonial,
    style,
    mainimage,
    gallery,
    "services": services[]->name
  }
`
  )
  .then((projects) => {
    projects.forEach((project, index) => {
      const projectTemplate = `
                <a href="#" class="portfolio_item w-inline-block" data-index="${index}">
                    <div class="portfolio-image_wrapper" style="will-change: transform; transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;">
                        <img src="${urlFor(
                          project.mainimage.asset
                        ).url()}" loading="eager" alt="${
        project.projectname
      }" class="project-main-image">
                        <div class="white-reflection" style="will-change: transform; transform: translate3d(25%, -30%, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(-21deg) skew(0deg, 0deg); transform-style: preserve-3d;">
                        </div>
                        <div class="project-image-overlay"></div>
                    </div>
                    <div class="portfolio-main-title_wrapper">
                        <div class="portfolio-counter_wrapper">
                            <div class="text-size-large">00.${index + 1}</div>
                            <div class="portfolio-counter_line"></div>
                        </div>
                        <div class="portfolio-title_wrapper">
                            <div class="portfolio-title_text">${
                              project.projectname
                            }</div>
                        </div>
                    </div>
                    <div class="margin-top margin-small">
                        <div class="padding-global">
                            <div class="container-large">
                                <div class="portfolio-bottom-content_wrapper text-color-brown text-style-italic">
                                    <div class="margin-bottom margin-xsmall">
                                        <div class="portfolio-info-content_wrapper">
                                            <div class="portfolio-description-wrapper">
                                                <div class="type-of-client">${
                                                  project.client
                                                }</div>
                                                <div class="proj-location">${
                                                  project.location
                                                }</div>
                                            </div>
                                            <div class="portfolio-description-wrapper">
                                                ${
                                                  project.services
                                                    ? project.services
                                                        .map(
                                                          (service) =>
                                                            `<div class="work-you-did">${service}</div>`
                                                        )
                                                        .join("")
                                                    : ""
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div class="portfolio-testim_wrapper">
                                        <div class="w-embed"><svg diplay="block" width="32" height="25" viewBox="0 0 32 25">
                                                <g id="Group_13" data-name="Group 13" transform="translate(-303 -737)">
                                                    <path id="Union_1" data-name="Union 1"
                                                        d="M9.079,21V14.889A7.532,7.532,0,1,1,15,7.528V21Z"
                                                        transform="translate(303 737)" fill="currentColor"></path>
                                                    <path id="Union_2" data-name="Union 2"
                                                        d="M9.079,21V14.889A7.532,7.532,0,1,1,15,7.528V21Z"
                                                        transform="translate(320 741)" fill="currentColor"></path>
                                                </g>
                                            </svg></div>
                                        <div class="portfolio-testimonial-short">${
                                          project.testimonial
                                        }</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            `;

      // Append the generated template to a container in your Webflow page
      document.querySelector(".portfolio_list").innerHTML += projectTemplate;

      // Attach event listener for modal trigger using event delegation
      $(".portfolio_list").on("click", ".portfolio_item", function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        const index = $(this).data("index"); // Get the index of the clicked item
        const project = projects[index]; // Get the corresponding project data
        populateSlider(project); // Pass the current project to the slider function

        lenis.stop();

        $("body").css("overflow", "hidden");
      });
    });

    Webflow.require("ix2").init();
  });

$(".portfolio-slider-close-button").on("click", function (event) {
  dePopulateSlider();

  lenis.start();

  $("body").css("overflow", "auto");
});

// Function to populate the slider with images from the gallery and generate navigation dots
function populateSlider(currentProject) {
  const $sliderContainer = $(".slider-container");
  const $sliderIndicators = $(".slider-indicators");
  const sliderElement = document.querySelector(".swiffy-slider");

  // Clear any existing slides and dots
  $sliderContainer.empty();
  $sliderIndicators.empty();

  // Load and append the main image as the first slide
  const mainImageUrl = urlFor(currentProject.mainimage.asset).url(); // Assuming mainImage is a field in currentProject
  const mainSlide = `
        <li>
            <div class="portfolio-slider-image_wrapper">
                <img src="${mainImageUrl}" alt="Main project image" class="portfolio-slider-image">
            </div>
        </li>
    `;
  const mainDot = `<li class="active"></li>`; // The main image dot is set as active

  // Append the main slide and its dot first
  $sliderContainer.append(mainSlide);
  $sliderIndicators.append(mainDot);

  // Populate slider with images from the gallery
  currentProject.gallery.forEach((image, index) => {
    const imageUrl = urlFor(image.asset).url();
    const slide = `
            <li>
                <div class="portfolio-slider-image_wrapper">
                    <img src="${imageUrl}" alt="Project image" class="portfolio-slider-image">
                </div>
            </li>
        `;
    const dot = `<li ${index === 0 ? "" : ""}></li>`; // Additional dots for gallery images

    // Append slide and dot
    $sliderContainer.append(slide);
    $sliderIndicators.append(dot);
  });

  // Reinitialize Swiffy Slider after populating it with dynamic content
  swiffyslider.init(); // This ensures the slider works properly after adding slides dynamically
}

// Function to depopulate the slider with images from the gallery and generate navigation dots
function dePopulateSlider() {
  const $sliderContainer = $(".slider-container");
  const $sliderIndicators = $(".slider-indicators");

  // Clear any existing slides and dots
  $sliderContainer.empty();
  $sliderIndicators.empty();

  // Reinitialize Swiffy Slider after populating it with dynamic content
  swiffyslider.init(); // This ensures the slider works properly after adding slides dynamically
}

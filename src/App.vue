<template>
  <div class="container">
    <div id="fixed-container">
      <h2 class="title">Generate Image</h2>
      <form @submit.prevent="handleSubmit">
        <input v-model="text" id="input" type="text" name="text" placeholder="Use your fucking imagination! 👨🏽‍🚀 " required>
        <br><br>
        <button type="submit" id="generateButton">Generate</button>
        <br><br>
      </form>
    </div>
    <div v-if="!images || images.length === 0" class="no-images">No images available</div>
    <button v-if="!images || images.length === 0" @click="eat">Reload</button>
    <div class="swiper-container" ref="swiperContainer" v-else>
      <div class="swiper-wrapper">
        <div v-for="(image, index) in reversedImages" :key="index" class="swiper-slide">
          <div class="image-wrapper">
            <img :src="image?.url" :class="{ 'image-enlarged': isEnlarged(index) }" @click="toggleEnlarged(index)" />
            {{ JSON.stringify(image?.url?.slice(26, 50))?.replace(/"/g, '')?.replace('.png', '') }}

            <div v-if="isEnlarged(index)" class="overlay">
              <button class="delete-button" @click="deleteImage(index, image.url)">X</button>
              <a :download="image?.name" :href="getDownloadURL(image?.url)" @click="downloadImage(image?.url)">
                <button v-show="isEnlarged(index)" class="download-button">Download</button>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
  </div>
</template>

<style>
/* Your CSS styles here */

.fixed-container {
  position: absolute;
  top: 200px;
  left: 0;
  width: 100%;
}

.no-images {
  margin-top: 50px;
  font-size: 18px;
}

.swiper-slide {
  display: inline-block;
  width: 25%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 10px;
}
</style>


<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import Swiper from 'swiper';

const text = ref('');
const images = ref([]);
const enlargedIndex = ref(-1);
const password = 'your_password_here';
const generationStatus = ref(null);
const imagesRef = ref([]);

const eat = () => {
  location.reload();
}

async function handleSubmit() {
  try {
    const response = await fetch('http://localhost:3000/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, text: text.value }),
    });

    const data = await response.json();
    if (response.ok) {
      images.value.push(data.image); // Add the newly generated image to the existing images
      generationStatus.value = 'success';
      imagesRef.value = [...images.value]; // Update the images ref to trigger a re-render

      // Hard reload the page after 10 seconds
      setTimeout(() => {
        location.reload();
      }, 9000);
    } else {
      throw new Error(data.error); // Throw an error if the response is not successful
    }
  } catch (error) {
    console.error(error);
    generationStatus.value = 'error';
  }
}

onMounted(async () => {
  await fetchImages();
  initializeSwiper();
});

const reversedImages = computed(() => {
  // Use the Array.prototype.reverse() method to reverse the order of the images array
  return images.value.slice().reverse();
});

watch([images, imagesRef], (newValue, oldValue) => {
  // This callback runs when myReactiveProperty changes
  console.log('Property changed from', oldValue, 'to', newValue);
});



function fetchImages() {
  return fetch('http://localhost:3000/get-images')
    .then(response => response.json())
    .then(data => {
      images.value = data.images;
      imagesRef.value = [...images.value]; // Initialize the images ref with the initial images array
    })
    .catch(error => {
      console.error(error);
      images.value = [];
      imagesRef.value = [];
    });
}

function initializeSwiper() {
  new Swiper('.swiper-container', {
    slidesPerView: 4,
    spaceBetween: 30,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
}

function isEnlarged(index) {
  return enlargedIndex.value === index;
}

function toggleEnlarged(index) {
  if (isEnlarged(index)) {
    enlargedIndex.value = -1;
  } else {
    enlargedIndex.value = index;
  }
}

async function deleteImage(index, filename) {

  let sure = confirm('sure?')
// getting filename


if(sure){

const response = await fetch('http://localhost:3000/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, text: filename }),
    });


  console.log('filename', filename)
    const data = await response.json();


  images.value.splice(index, 1);
  imagesRef.value = [...images.value]; // Update the images ref to trigger a re-render

  console.log(data, 'data to frontend from delete route')
  
}
else{return}
}

async function getDownloadURL(imageURL) {
  try {
    const response = await fetch(imageURL);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error(error);
    return '';
  }
}

async function downloadImage(imageURL) {
  try {
    const url = await getDownloadURL(imageURL);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'image.jpg';
    link.click();
  } catch (error) {
    console.error(error);
  }
}
</script>

<style>
/* Your CSS styles here */

.fixed-container {
  position: absolute;
  top: 200;
  left: 0;
  width: 100%;
}

.no-images {
  margin-top: 50px;
  font-size: 18px;
}
</style>
<style>

html {
  background: black;
  color: magenta;
}

#generateButton {
  background: black;
  color: magenta;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1.3rem;
}

#generateButton:hover {
  background: black;
  color: magenta;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1.3rem;
  font-style: italic;
}

#input {
  border-radius: 1em;
  text-align: center;
}

.container {
  margin-top: 100px;
  text-align: center;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
}

.swiper-container {
  width: 100%;
  height: 200px;
  margin: 0 auto;
}

.image-wrapper {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 5px;
}

.image {
  width: 150%;
  height: 150%;
  object-fit: cover;
  transition: transform 0.3s;
}

img:hover {
  width: 100%; height: 100%;
  object-fit:fit-content;
}

.image-enlarged {
  transform: scale(1);
}

.overlay {
  position: absolute;
  top:   0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.delete-button {
  padding: 5px;
  font-size: larger;
  font-weight: bold;
  width: 30px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s;
}

.delete-button:hover {
  opacity: 0.8;
}

.download-button {
  position: absolute;
  top: 50%;
  font-size: 2rem;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  background: black;
  color: magenta;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.download-button.visible {
  opacity: 1;
}

.download-button:hover {
  opacity: 0.8;
}
</style>

<template>
  <NavigationBar style="margin-top: 30px"></NavigationBar>
  <div style="width: 80%; margin: 2% 5% 5% 5%;">
  <RouterView></RouterView>
  </div>
</template>

<script setup>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import NavigationBar from "@/views/Navbar.vue";
import 'v-calendar/style.css';
</script>
<style scoped></style>
<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link active" aria-current="page" to="/">{{$t('Home-title')}}</RouterLink>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{$t('Navbar1')}}
            </a>
            <ul class="dropdown-menu">
              <li><RouterLink class="dropdown-item" to="/ERG/OPs">OPs</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/ERG/CWave">C-Wave</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/ERG/VEP">VEP</RouterLink></li>
<!--              <li><RouterLink class="dropdown-item" to="/ERG/PhNR">PhNR</RouterLink></li>-->
              <li><RouterLink class="dropdown-item" to="/OCT/TotalLayer">OCT Total Layer</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/OCT/FourLayer">OCT Four Layer</RouterLink></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{$t('Navbar2')}}
            </a>
            <ul class="dropdown-menu">
              <li><RouterLink class="dropdown-item" to="/ERG/OPsWaveComparison">OPs Wave Comparison</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/ERG/ABWaveComparison">AB Wave in C Wave Comparison</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/ERG/CWaveComparison">C Wave Comparison</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/ERG/ABCWaveComparison">ABC Wave Comparison</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/ERG/VEPWaveComparison">VEP Comparison</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/PLR/PLRComparison">PLR Comparison</RouterLink></li>
<!--              <li><RouterLink class="dropdown-item" to="/ERG/PhNRWaveComparison">PhNR Comparison</RouterLink></li>-->
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{$t('Navbar3')}}
            </a>
            <ul class="dropdown-menu">
              <RouterLink class="nav-link active" aria-current="page" to="/ERG/GroupingByCWaveData">{{$t('Navbar3a')}}</RouterLink>
              <RouterLink class="nav-link active" aria-current="page" to="/UpdateFileNameExceptCWave">{{$t('Navbar3b')}}</RouterLink>
            </ul>
          </li>
<!--          <li class="nav-item dropdown">-->
<!--            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">-->
<!--              打工仔專區-->
<!--            </a>-->
<!--            <ul class="dropdown-menu">-->
<!--              <RouterLink class="nav-link active" aria-current="page" to="/TimePicker">打卡</RouterLink>-->
<!--              <RouterLink class="nav-link active" aria-current="page" to="/AllTimePickerList">全部打卡列表</RouterLink>-->
<!--              <RouterLink class="nav-link active" aria-current="page" to="/PersonalTimePickerList">個人打卡列表</RouterLink>-->
<!--            </ul>-->
<!--          </li>-->
<!--          <li class="nav-item">-->
<!--            <RouterLink class="nav-link active" aria-current="page" to="/Member/Register">註冊</RouterLink>-->
<!--          </li>-->
<!--          <li class="nav-item">-->
<!--            <RouterLink class="nav-link active" aria-current="page" to="/Member/memberLogin">登入</RouterLink>-->
<!--          </li>-->
        </ul>
      </div>
      <button class="btn btn-outline-secondary ms-auto" @click="toggleLanguage" :disabled="changeLanguageButton">
        {{$t('button')}}
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {ref} from "vue";

const { locale } = useI18n()

const changeLanguageButton = ref(false);

function toggleLanguage() {
  changeLanguageButton.value = true;
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
  setTimeout(() => {changeLanguageButton.value = false;},1200);
}
</script>

<style></style>

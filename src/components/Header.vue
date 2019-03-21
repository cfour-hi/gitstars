<template>
  <header id="header">
    <div class="user-info">
      <a :href="user.html_url" target="_blank" rel="noopener noreferrer"><img :src="user.avatar_url" class="user-avatar"></a>
      <h1 class="user-name">
        <a :href="`${user.html_url}?tab=repositories`" target="_blank" rel="noopener noreferrer">{{ user.name }}’s Starred Repositories</a>
      </h1>
    </div>
    <el-radio-group v-model="currentLanguage" size="mini" @change="handleChangeLanguage">
      <el-radio-button v-for="language of languages" :key="language" :label="$t(language)"></el-radio-button>
    </el-radio-group>
    <a href="https://github.com/Monine/gitstars" target="_blank" class="octocat-link" rel="noopener noreferrer">
      <svg width="60" height="60" viewBox="0 0 250 250" aria-hidden="true" class="octocat">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
        <path class="octocat-arm" d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor"></path>
        <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor"></path>
      </svg>
    </a>
  </header>
</template>

<script>
import config from '@/config'

export default {
  name: 'app-header',
  data () {
    const { messages, locale } = this.$i18n
    return {
      user: window._gitstars.user,
      languages: Object.keys(messages),
      currentLanguage: this.$t(locale),
    }
  },
  methods: {
    handleChangeLanguage (language) {
      const texts = this.$i18n.messages[this.languages[0]]
      for (let key of Object.keys(texts)) {
        if (texts[key] === language) {
          this.$i18n.locale = key
          window.localStorage.setItem(config.i18nLocaleKey, key)
          return
        }
      }
    },
  },
}
</script>

<style scoped>
#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 59px;
  position: relative;
  min-width: 980px;
  padding: 0 75px 0 5px;
  border-bottom: 1px solid #e9e9e9;
}

.user-info {
  display: inline-flex;
  align-items: center;
}

.user-avatar {
  height: 40px;
  margin: 0 10px;
  border-radius: 50%;
}

.user-name {
  font-size: 20px;
  text-align: center;
  color: #7265e6;
}

.octocat-link {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
}

.octocat {
  color: #fff;
  fill: #7265e6b3;
  transition: fill 0.3s;
}

.octocat:hover {
  fill: #7265e6;
}

.octocat-arm {
  transform-origin: 130px 106px;
}

.octocat:hover .octocat-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%,
  100% {
    transform: rotate(0);
  }
  20%,
  60% {
    transform: rotate(-25deg);
  }
  40%,
  80% {
    transform: rotate(10deg);
  }
}
</style>

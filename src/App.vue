<template>
  <div id="app">
    <EmailDropdown :domains="domains" :maxSuggestions="5" :defaultDomains="defaultDomains" />
  </div>
</template>

<script>
import EmailDropdown from "./components/EmailDropdown.vue";

export default {
  name: "app",
  components: {
    EmailDropdown
  },
  data() {
    return {
      domains: [
        "126.com",
        "139.com",
        "163.com",
        "aol.com",
        "buston.cn",
        "foxmail.com",
        "gmail.com",
        "gmx.de",
        "googlemail.com",
        "hensao.com",
        "hggame.com",
        "hotmail.co.uk",
        "hotmail.com",
        "hotmail.fr",
        "hotmail.it",
        "kcidc.com",
        "live.com",
        "love11.com",
        "mail.ru",
        "msn.com",
        "oneplus.cn",
        "oneplus.net",
        "outlook.com",
        "pay55.com",
        "qq.com",
        "rediffmail.com",
        "sfba.cn",
        "sina.com",
        "sohu.com",
        "tour0.com",
        "vip.qq.com",
        "web.de",
        "yahoo.co.in",
        "yahoo.co.uk",
        "yahoo.com",
        "yahoo.in",
        "yeah.net",
        "ymail.com",
        "ytgame.com"
      ],
      defaultDomains: ["gmail.com", "hotmail.com", "msn.com", "outlook.com", "yahoo.com"]
    };
  }
};
</script>

<style>
#app {
  margin-top: 300px;
  display: flex;
  text-align: center;
  justify-content: center;
}
</style>
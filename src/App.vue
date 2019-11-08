<template>
  <div id="app">
    <EmailDropdown
      initialValue="some@"
      :closeOnClickOutside="clickOutside"
      :domains="domains"
      :maxSuggestions="5"
      :defaultDomains="defaultDomains"
    />
    <p id="1">Some text 1</p>
    <p id="2">Some text 2</p>
    <p id="3">Some text 3</p>
    <p id="4">Some text 4</p>
    <p id="5">Some text 5</p>
    <p id="6">Some text 6</p>
    <p id="7">Some text 7</p>
    <p id="8">Some text 8</p>
    <p id="9">Some text 9</p>
    <p id="10">Some text 10</p>
    <input type="checkbox" v-model="clickOutside" />
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
      clickOutside: false,
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

<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #f9f9f9;
  p {
    margin: 0;
  }
}
</style>

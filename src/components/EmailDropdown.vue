<template>
  <div class="email-dropdown-wrapper" v-click-outside="clickOutsideConfig">
    <div>
      <input
        v-bind="$attrs"
        v-on="$listeners"
        ref="email"
        type="email"
        :value="email"
        :class="inputClasses"
        @focus="handleEmailInputFocus"
        @blur="handleEmailInputBlur"
        @input="handleInputEvent"
        @keyup.up="handleListNavigation('up')"
        @keyup.down="handleListNavigation('down')"
        @keyup.esc="handleEscPress"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
      />
      <button v-if="showCleanButton" @click="clearInput" value="x" />
    </div>
    <div class="email-dropdown-list-container" :class="{ hide: hasclickedOutside }">
      <ul v-if="shouldShowList" class="email-dropdown-list">
        <li
          v-for="(domain, index) in domainsList"
          :key="index"
          tabindex="-1"
          :data-dropdown-item-index="index"
          class="email-dropdown-item"
          :class="{'email-dropdown-item-focus': index === listFocusIndex && !isEmailInputFocused}"
          @click="handleOptionSelection(domain)"
          @keyup.esc="handleEscPress"
          @keyup.enter="handleOptionSelection(domain)"
          @keyup.up="handleListNavigation('up')"
          @keyup.down="handleListNavigation('down')"
          @keyup="convertCharToText"
        >{{ emailWithoutDomain }}@{{ domain }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import vClickOutside from "v-click-outside";
import keycoder from "keycoder";

Vue.use(vClickOutside);

export default {
  name: "EmailDropdown",
  inheritAttrs: false,
  props: {
    initialValue: {
      type: String,
      default: ""
    },
    showCleanButton: {
      type: Boolean,
      default: false
    },
    domains: {
      type: Array,
      required: true
    },
    defaultDomains: {
      type: Array,
      default() {
        return [];
      }
    },
    maxSuggestions: {
      type: Number,
      default: 4,
      validator(num) {
        const isInteger = Number.isInteger(num);
        if (!isInteger) {
          throw new Error(
            `Invalid prop: type check failed for prop "maxSuggestions". Expected Integer but got ${num} as value.`
          );
        }

        return isInteger;
      }
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true
    },
    inputClasses: {
      type: [String, Array, Object],
      default: ""
    }
  },
  data() {
    return {
      email: this.initialValue,
      isOptionSelected: false,
      isEscPressed: false,
      isEmailInputFocused: false,
      listFocusIndex: 0,
      isFirstFocus: false,
      hasclickedOutside: false,
      clickOutsideConfig: {
        handler: this.clickOutsideHandler,
        middleware: this.middleware,
        events: ["dblclick", "click"],
        isActive: true
      }
    };
  },
  computed: {
    shouldShowList() {
      return Boolean(this.domainsList.length && !this.optionIsSelected && !this.isEscPressed);
    },
    includesAt() {
      return this.email.toLowerCase().includes("@");
    },
    emailWithoutDomain() {
      return this.email.toLowerCase().split("@")[0];
    },
    emailDomain() {
      return this.email.toLowerCase().split("@")[1] || "";
    },
    suggestionList() {
      return this.domainsList.map(domain => `${this.emailWithoutDomain}@${domain}`.toLowerCase());
    },
    optionIsSelected() {
      return this.suggestionList.includes(this.email.toLowerCase());
    },
    domainsList() {
      if (!this.includesAt) {
        return [];
      }

      if (!this.emailDomain.length && this.defaultDomains.length) {
        return this.defaultDomains
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
          .slice(0, this.maxSuggestions);
      }

      if (!this.emailDomain) {
        return [];
      }

      return this.domains
        .filter(domain => domain.startsWith(this.emailDomain))
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .slice(0, this.maxSuggestions);
    }
  },
  watch: {
    email() {
      this.$emit("input", this.email);
      this.resetFocusIndex();
      if (this.isEscPressed) {
        this.isEscPressed = false;
      }
    }
  },
  methods: {
    convertCharToText(event) {
      const INVALID_KEYS = {
        ENTER: 13,
        UP: 38,
        DOWN: 40
      };
      const eventObject = keycoder.fromEvent(event);
      const isValidEventChar = eventObject && !Object.values(INVALID_KEYS).includes(eventObject.charCode);

      if (isValidEventChar) {
        const char = keycoder.eventToCharacter(event);
        if (char) {
          this.email += char;
          this.$refs.email.focus();
        }
      }
    },
    clickOutsideHandler() {
      this.hasclickedOutside = true;
    },
    handleInputEvent({ target: { value: email } }) {
      this.email = email;
    },
    handleOptionSelection(domain) {
      this.email = `${this.emailWithoutDomain}@${domain}`;
      this.isOptionSelected = true;
      this.$refs.email.focus();
      this.listFocusIndex = 0;
    },
    middleware({ target }) {
      const isDropdownItem =
        target.className === "email-dropdown-item" && target.parentNode.className.includes("email-dropdown-list");

      return this.closeOnClickOutside && !isDropdownItem;
    },
    handleEscPress() {
      this.isEscPressed = true;
      this.$refs.email.focus();
    },
    handleEmailInputFocus() {
      this.isEmailInputFocused = true;
      this.hasclickedOutside = false;
      this.resetFocusIndex();
    },
    handleEmailInputBlur() {
      this.isEmailInputFocused = false;
    },
    resetFocusIndex() {
      this.isFirstFocus = false;
      this.listFocusIndex = 0;
    },
    handleListNavigation(direction) {
      if (!this.shouldShowList || this.shouldFocusInput(direction)) return;

      const shouldScrollUp = direction == "up" && this.listFocusIndex >= 1;
      const shouldSchollDown = direction == "down" && this.listFocusIndex < this.domainsList.length - 1;

      if (this.isFirstFocus) {
        if (shouldScrollUp) {
          this.listFocusIndex -= 1;
        } else if (shouldSchollDown) {
          this.listFocusIndex += 1;
        }
      } else {
        this.isFirstFocus = true;
      }

      this.$nextTick(() => {
        document.querySelector(`[data-dropdown-item-index="${this.listFocusIndex}"]`).focus();
      });
    },
    shouldFocusInput(direction) {
      const shouldFocus = direction === "up" && this.listFocusIndex == 0;

      if (shouldFocus) {
        this.$refs.email.focus();
        this.resetFocusIndex();
      }

      return shouldFocus;
    },
    clearInput(e) {
      e.preventDefault();
      this.email = '';
    }
  }
};
</script>

<style lang="scss" scoped>
.email-dropdown-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;

  .email-dropdown-list-container {
    position: relative;
    height: 0;

    &.hide {
      display: none;
    }
  }

  .email-dropdown-list {
    height: auto;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10000;
    background-color: #fff;
    overflow: hidden;
    list-style: none;
    margin: 0;
    padding: 0;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    border: 0.1px solid darkgrey;
    box-sizing: border-box;
    margin-top: -0.9px;

    .email-dropdown-item {
      cursor: pointer;
      padding-left: 2px;
      padding: 2px;

      &:first-child {
        border-top: none;
      }

      &:hover,
      &:focus {
        background-color: #f2f2f2;
        border: 0.1px solid darkgrey;
        box-sizing: border-box;
      }
    }
  }
}
</style>

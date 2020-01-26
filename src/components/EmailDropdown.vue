<template>
  <div class="email-dropdown-wrapper" v-click-outside="clickOutsideConfig">
    <div class="input-button-wrapper">
      <input
        v-bind="$attrs"
        v-on="$listeners"
        ref="email"
        type="email"
        :value="email"
        :class="inputClasses"
        @focus="handleEmailInputFocus"
        @input="handleInputEvent"
        @keyup.up="handleListNavigation('up')"
        @keyup.down="handleListNavigation('down')"
        @keyup.esc="handleEscPress"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
      />
    </div>
    <div :class="emailDropdownContainerClasses">
      <ul v-if="shouldShowList" class="email-dropdown-list">
        <li
          v-for="(domain, index) in domainsList"
          :key="index"
          tabindex="-1"
          :data-dropdown-item-index="`${index}-${internalId}`"
          class="email-dropdown-item"
          @click="handleOptionSelection(domain)"
          @keyup.esc="handleEscPress"
          @keyup.enter="handleOptionSelection(domain)"
          @keyup.up="handleListNavigation('up')"
          @keyup.down="handleListNavigation('down')"
          @keyup="convertCharToText"
        >
          <span class="email-dropdown-item-username">{{ username }}@</span>
          <span class="email-dropdown-item-domain">{{ domain }}</span>
        </li>
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
      default: "",
      validator(value) {
        // Since we ask for the instances of InputEvent while running the test
        // this is a workaround
        if (value && value.target && typeof value.target.value === "string") {
          return true;
        }
        return typeof value === "string";
      }
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
      internalId: Math.random()
        .toString(16)
        .slice(2),
      email: this.initialValue.target ? this.initialValue.target.value : this.initialValue,
      isEscPressed: false,
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
      return Boolean(this.domainsList.length && !this.isOptionSelected && !this.isEscPressed);
    },
    includesAt() {
      return this.email.toLowerCase().includes("@");
    },
    username() {
      return this.email.toLowerCase().split("@")[0];
    },
    emailDropdownContainerClasses() {
      return {
        "email-dropdown-list-container": true,
        hide: this.hasclickedOutside
      };
    },
    domain() {
      return this.email.toLowerCase().split("@")[1] || "";
    },
    suggestionList() {
      return this.domainsList.map(domain => `${this.username}@${domain}`.toLowerCase());
    },
    isOptionSelected() {
      return this.suggestionList.includes(this.email.toLowerCase());
    },
    domainsList() {
      if (!this.includesAt) {
        return [];
      }

      if (!this.domain.length && this.defaultDomains.length) {
        return this.defaultDomains.slice(0, this.maxSuggestions);
      }

      if (!this.domain) {
        return [];
      }

      return this.domains
        .filter(domain => domain.startsWith(this.domain))
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
    },
    initialValue(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.email = newVal.target ? newVal.target.value : newVal;
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
    handleInputEvent(input) {
      this.email = input.target.value;
    },
    handleOptionSelection(domain) {
      this.email = `${this.username}@${domain}`;
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
      this.hasclickedOutside = false;
      this.resetFocusIndex();
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
        document.querySelector(`[data-dropdown-item-index="${this.listFocusIndex}-${this.internalId}"]`).focus();
      });
    },
    shouldFocusInput(direction) {
      const shouldFocus = direction === "up" && this.listFocusIndex == 0;

      if (shouldFocus) {
        this.$refs.email.focus();
        this.resetFocusIndex();
      }

      return shouldFocus;
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

  .input-button-wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
  }

  input {
    text-overflow: ellipsis;
    width: 100%;
    padding-right: 0;
  }

  button {
    padding: 0;
    margin-left: -11.8px;
    margin-right: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;

    &:focus {
      outline: none;
    }
  }

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

      &-username {
        color: #999;
      }

      &-domain {
        color: #101920;
        font-weight: 500;
      }
    }
  }
}
</style>

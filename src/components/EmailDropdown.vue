<template>
  <div class="email-dropdown-wrapper" v-click-outside="clickOutsideConfig">
    <input
      v-bind="$attrs"
      v-on="$listeners"
      ref="email"
      type="email"
      :value="email"
      @focus="() => (clickedOutside = false)"
      @input="handleInputEvent"
      @keyup.up="scroll('up')"
      @keyup.down="scroll('down')"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
    />
    <div class="email-dropdown-list-container" :class="{ hide: clickedOutside }">
      <ul v-if="shouldShowList" class="email-dropdown-list">
        <li
          v-for="(domain, index) in domainsList"
          :key="index"
          :tabindex="index"
          :data-dropdown-item-index="index"
          class="email-dropdown-item"
          @click="handleOptionSelection(domain)"
          @keyup.enter="handleOptionSelection(domain)"
          @keyup.up="scroll('up')"
          @keyup.down="scroll('down')"
          @keyup="convertCharToText"
        >
          {{ emailWithoutDomain }}@{{ domain }}
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
  props: {
    initialValue: {
      default: "",
      validator(value) {
        if (value instanceof InputEvent) {
          value = value.target.value;
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
    }
  },
  data() {
    return {
      email: this.initialValue,
      isOptionSelected: false,
      listIndex: 0,
      isFirstFocus: false,
      clickedOutside: false,
      clickOutsideConfig: {
        handler: this.handler,
        middleware: this.middleware,
        events: ["dblclick", "click"],
        isActive: true
      }
    };
  },
  computed: {
    shouldShowList() {
      return this.includesAt && this.domainsList.length && !this.optionIsSelected && this.emailWithoutDomain;
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
    fakeDomains() {
      return this.domainsList.map(domain => `${this.emailWithoutDomain}@${domain}`.toLowerCase());
    },
    optionIsSelected() {
      return this.fakeDomains.includes(this.email.toLowerCase());
    },
    domainsList() {
      if (!this.includesAt) return [];

      if (!this.emailDomain.length && this.defaultDomains.length) {
        return this.defaultDomains
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
          .slice(0, this.maxSuggestions);
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
      this.resetFocusFromList();
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
    handler() {
      this.clickedOutside = true;
    },
    handleInputEvent({ target: { value: email } }) {
      this.email = email;
    },
    handleOptionSelection(domain) {
      this.email = `${this.emailWithoutDomain}@${domain}`;
      this.isOptionSelected = true;
      this.$refs.email.focus();
      this.listIndex = 0;
    },
    middleware({ target }) {
      const isDropdownItem =
        target.className === "email-dropdown-item" && target.parentNode.className.includes("email-dropdown-list");

      return this.closeOnClickOutside && !isDropdownItem;
    },
    resetFocusFromList() {
      this.isFirstFocus = false;
      this.listIndex = 0;
    },
    scroll(direction) {
      if (!this.shouldShowList || this.shouldFocusInput(direction)) return;

      const shouldScrollUp = direction == "up" && this.listIndex >= 1;
      const shouldSchollDown = direction == "down" && this.listIndex < this.domainsList.length - 1;

      if (this.isFirstFocus) {
        if (shouldScrollUp) {
          this.listIndex -= 1;
        } else if (shouldSchollDown) {
          this.listIndex += 1;
        }
      } else {
        this.isFirstFocus = true;
      }

      this.$nextTick(() => {
        document.querySelector(`[data-dropdown-item-index="${this.listIndex}"]`).focus();
      });
    },
    shouldFocusInput(direction) {
      const shouldFocus = direction === "up" && this.listIndex == 0;

      if (shouldFocus) {
        this.$refs.email.focus();
        this.resetFocusFromList();
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

    .email-dropdown-item {
      cursor: pointer;

      &:hover {
        background-color: #f2f2f2;
      }

      &:focus {
        background-color: #f6f6f6;
      }
    }
  }
}
</style>

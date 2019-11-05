<template>
  <div class="email-dropdown-wrapper">
    <input
      v-bind="$attrs"
      v-on="$listeners"
      ref="email"
      type="email"
      :value="email"
      @input="handleInputEvent"
      @keyup.up="scroll('up')"
      @keyup.down="scroll('down')"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
    />
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
      >{{ emailWithoutDomain }}@{{ domain }}</li>
    </ul>
  </div>
</template>

<script>
import keycoder from "keycoder";

export default {
  name: "EmailDropdown",
  props: {
    initialValue: {
      type: String,
      default: ""
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
    }
  },
  data() {
    return {
      email: this.initialValue,
      isOptionSelected: false,
      listIndex: 0,
      isFirstFocus: false
    };
  },
  computed: {
    shouldShowList() {
      return (
        this.includesAt && this.domainsList.length && !this.optionIsSelected
      );
    },
    includesAt() {
      return this.email.includes("@");
    },
    emailWithoutDomain() {
      return this.email.split("@")[0];
    },
    emailDomain() {
      return this.email.split("@")[1] || "";
    },
    fakeDomains() {
      return this.domainsList.map(
        domain => `${this.emailWithoutDomain}@${domain}`
      );
    },
    optionIsSelected() {
      return this.fakeDomains.includes(this.email);
    },
    domainsList() {
      if (!this.includesAt) return [];

      if (!this.emailDomain.length && this.defaultDomains.length) {
        return this.defaultDomains
          .sort((a, b) => a.localeCompare(b))
          .slice(0, this.maxSuggestions);
      }

      return this.domains
        .filter(domain => domain.startsWith(this.emailDomain))
        .sort((a, b) => a.localeCompare(b))
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
    handleInputEvent({ target: { value: email } }) {
      this.email = email;
    },
    convertCharToText(event) {
      const INVALID_KEYS = {
        ENTER: 13,
        UP: 38,
        DOWN: 40
      };
      const eventObject = keycoder.fromEvent(event);
      const isValidEventChar =
        eventObject &&
        !Object.values(INVALID_KEYS).includes(eventObject.charCode);

      if (isValidEventChar) {
        const char = keycoder.eventToCharacter(event);
        if (char) {
          this.email += char;
          this.$refs.email.focus();
        }
      }
    },
    resetFocusFromList() {
      this.isFirstFocus = false;
      this.listIndex = 0;
    },
    handleOptionSelection(domain) {
      this.email = `${this.emailWithoutDomain}@${domain}`;
      this.isOptionSelected = true;
      this.$refs.email.focus();
      this.listIndex = 0;
    },
    shouldFocusInput(direction) {
      const shouldFocus = direction === "up" && this.listIndex == 0;

      if (shouldFocus) {
        this.$refs.email.focus();
        this.resetFocusFromList();
      }

      return shouldFocus;
    },

    scroll(direction) {
      if (!this.shouldShowList) return;
      const length = this.domainsList.length;

      if (this.shouldFocusInput(direction)) {
        return;
      }

      if (direction == "up" && this.listIndex == 0) {
        this.$refs.email.focus();
        this.resetFocusFromList();
        return;
      }

      if (this.isFirstFocus) {
        if (direction == "up" && this.listIndex >= 1) {
          this.listIndex -= 1;
        } else if (direction == "down" && this.listIndex < length - 1) {
          this.listIndex += 1;
        }
      } else {
        this.isFirstFocus = true;
      }

      this.$nextTick(() => {
        document
          .querySelector(`[data-dropdown-item-index="${this.listIndex}"]`)
          .focus();
      });
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

  .email-dropdown-list {
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: left;

    &:focus {
      background-color: green;
    }

    .email-dropdown-item {
      cursor: pointer;

      &:hover {
        background-color: #ccc;
      }

      &:focus {
        background-color: gainsboro;
      }
    }
  }
}
</style>

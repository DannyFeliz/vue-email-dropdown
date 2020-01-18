import Vue from "vue";
import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import EmailDropdown from "@/components/EmailDropdown.vue";

const deepEqualInAnyOrder = require("deep-equal-in-any-order");
const chai = require("chai");

chai.use(deepEqualInAnyOrder);

describe("EmailDropdown.vue", () => {
  let propsData;

  beforeEach(() => {
    propsData = {
      initialValue: "hello@",
      domains: ["google.com"],
      defaultDomains: ["hotmail.com", "outlook.com"],
      maxSuggestions: 4,
      closeOnClickOutside: true,
      clearable: false
    };
  });

  it("renders without show suggestions if the email does not include '@'", () => {
    propsData.initialValue = "hello";

    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    expect(wrapper.find(".email-dropdown-list").exists()).to.be.false;
  });

  it("shows suggestions with default domains", () => {
    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    const dropdownItems = wrapper.findAll(".email-dropdown-item");
    expect(dropdownItems).to.have.length(2);
    expect(dropdownItems.at(0).text()).to.equal("hello@hotmail.com");
    expect(dropdownItems.at(1).text()).to.equal("hello@outlook.com");
  });

  it("shows suggestions based in initialValue", () => {
    propsData.domains = ["gmail.com", "google.com", "outlook.com"];
    propsData.initialValue = "hello@g";

    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    const dropdownItems = wrapper.findAll(".email-dropdown-item");

    expect(dropdownItems).to.have.length(2);
    expect(dropdownItems.at(0).text()).to.be.equal("hello@gmail.com");
    expect(dropdownItems.at(1).text()).to.be.equal("hello@google.com");
  });

  it("hides suggestions if email match the suggestion", () => {
    propsData.initialValue = "hello@google.com";

    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    expect(wrapper.text()).to.be.empty;
    expect(wrapper.find(".email-dropdown-list").exists()).to.be.false;
    expect(wrapper.vm.isOptionSelected).to.be.true;
  });

  it("filter the suggestion list when type in the input", async () => {
    propsData.initialValue = "hello@g";
    propsData.domains = ["gmail.com", "google.com"];

    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    expect(wrapper.findAll(".email-dropdown-item")).to.have.length(2);
    wrapper.find("input").setValue("hello@gma");
    await Vue.nextTick();
    expect(wrapper.findAll(".email-dropdown-item")).to.have.length(1);
    expect(wrapper.find(".email-dropdown-item").text()).to.be.equal("hello@gmail.com");
  });

  it("hides suggestion list if remove '@' from the email", async () => {
    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    expect(wrapper.findAll(".email-dropdown-item")).to.have.length(2);
    wrapper.find("input").setValue("hello");
    await Vue.nextTick();
    expect(wrapper.find(".email-dropdown-list").exists()).to.be.false;
  });

  it("clears the email field when the x is clicked", async () => {
    propsData.clearable = true;
    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    wrapper.find("input").setValue("hello");
    await Vue.nextTick();
    wrapper.find("button").trigger("click");
    await Vue.nextTick();
    expect(wrapper.vm.$data.email).to.be.empty;
  });

  it("hides the x if the input not clearable", async () => {
    propsData.clearable = false;
    const wrapper = shallowMount(EmailDropdown, {
      propsData
    });

    wrapper.find("input").setValue("hello");
    await Vue.nextTick();
    expect(wrapper.find("button").exists()).to.be.false;
  });

  describe("events", () => {
    it("emits 'input' on email change", async () => {
      propsData.domains = ["gmail.com", "google.com"];

      const wrapper = shallowMount(EmailDropdown, {
        propsData
      });

      wrapper.find("input").setValue("hello@gmail");
      await Vue.nextTick();
      expect(wrapper.emitted().input[0]).to.have.length(1);
      expect(wrapper.emitted().input[0][0]).to.be.equal("hello@gmail");
      wrapper.find("input").setValue("hello@gmail.");
      await Vue.nextTick();
      expect(wrapper.emitted().input[1]).to.have.length(1);
      expect(wrapper.emitted().input[1][0]).to.be.equal("hello@gmail.");
    });
  });

  describe("props", () => {});

  describe("computed", () => {
    describe("includesAt", () => {
      it("returns 'true' if email includes '@'", () => {
        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.includesAt).to.be.true;
      });

      it("returns 'false' if email does not includes '@'", () => {
        propsData.initialValue = "hello";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.includesAt).to.be.false;
      });
    });

    describe("username", () => {
      it("returns the email without domain", () => {
        propsData.initialValue = "hello@google.com";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.username).to.be.equal("hello");
      });
    });

    describe("domain", () => {
      it("returns the email domain", () => {
        propsData.initialValue = "hello@google.com";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.domain).to.be.equal("google.com");
      });
    });

    describe("isOptionSelected", () => {
      it("returns 'true' if the email match an item from the suggestion list", () => {
        propsData.initialValue = "hello@google.com";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.isOptionSelected).to.be.true;
      });

      it("returns 'false' if the email doesn't match an item from the suggestion list", () => {
        propsData.initialValue = "hello@google.com";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.isOptionSelected).to.be.true;
      });
    });

    describe("domainsList", () => {
      it("returns an empty array if includesAt is 'false'", () => {
        propsData.initialValue = "hello";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.includesAt).to.be.false;
        expect(wrapper.vm.domainsList).to.be.empty;
      });

      it("returns default domains if doesn't have domain", () => {
        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });
        expect(wrapper.vm.includesAt).to.be.true;
        expect(wrapper.vm.domain).to.be.have.length(0);
        expect(wrapper.vm.defaultDomains).to.be.have.length.gt(0);
        expect(wrapper.vm.domainsList).to.deep.equalInAnyOrder(propsData.defaultDomains);
      });

      it("returns the domains based on 'domain'", () => {
        propsData.domains = ["google.com", "gmail.com"];
        propsData.initialValue = "hello@g";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });
        expect(wrapper.vm.includesAt).to.be.true;
        expect(wrapper.vm.domain).to.be.have.length(1);
        expect(wrapper.vm.domainsList).to.deep.equalInAnyOrder(propsData.domains);
      });

      it("return an empty list if doesn't have default domains", () => {
        propsData.domains = ["google.com", "gmail.com"];
        propsData.defaultDomains = [];
        propsData.initialValue = "hello@";

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.domainsList).to.be.have.length(0);
      });
    });

    describe("suggestionList", () => {
      it("returns a suggestion domain list based on the domain list", () => {
        propsData.domains = ["google.com", "gmail.com"];
        propsData.initialValue = "hello@g";

        const expected = ["hello@gmail.com", "hello@google.com"];

        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.suggestionList).to.deep.equalInAnyOrder(expected);
      });

      it("returns a suggestion domain list using the default domains", () => {
        propsData.defaultDomains = ["yahoo.com", "mns.com"];

        const expected = ["hello@yahoo.com", "hello@mns.com"];
        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });
        expect(wrapper.vm.includesAt).to.be.true;
        expect(wrapper.vm.domain).to.be.have.length(0);
        expect(wrapper.vm.suggestionList).to.deep.equalInAnyOrder(expected);
      });
    });

    describe("shouldShowList", () => {
      it("returns 'true' if domainsList is 'true' and isOptionSelected is 'false'", () => {
        propsData.initialValue = "hello@";
        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.domainsList).to.have.length.gt(0);
        expect(wrapper.vm.isOptionSelected).to.be.false;
        expect(wrapper.vm.shouldShowList).to.be.true;
      });

      it("returns 'false' if 'domainsList' is empty", () => {
        propsData.initialValue = "hello";
        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });
        expect(wrapper.vm.domainsList).to.be.eql([]);
        expect(wrapper.vm.shouldShowList).to.be.false;
      });

      it("returns 'false' if 'isOptionSelected' is false", () => {
        propsData.initialValue = "hello";
        const wrapper = shallowMount(EmailDropdown, {
          propsData
        });

        expect(wrapper.vm.isOptionSelected).to.be.false;
        expect(wrapper.vm.shouldShowList).to.be.false;
      });
    });
  });
});

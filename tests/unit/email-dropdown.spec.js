import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import EmailDropdown from "@/components/EmailDropdown.vue";

describe("EmailDropdown.vue", () => {
  let propsData;

  beforeEach(() => {
    propsData = {
      initialValue: "hello@",
      domains: ["google.com"],
      defaultDomains: ["hotmail.com", "outlook.com"],
      maxSuggestions: 4,
      closeOnClickOutside: true
    };
  });

  it("renders without show suggestions", () => {
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
  });
});

import { describe, it, expect } from '@jest/globals'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('should create the app', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  it(`should contain the 'HelloWorld' component`, () => {
    const wrapper = mount(App)
    expect(wrapper.findComponent({ name: 'HelloWorld' }).exists()).toBe(true)
  })

  it('should render the Vue logo', () => {
    const wrapper = mount(App)
    const logoImg = wrapper.find('img.logo')
    expect(logoImg.exists()).toBe(true)
    expect(logoImg.attributes('alt')).toBe('Vue logo')
  })

  it('should have a nav with Home and About links', () => {
    const wrapper = mount(App)
    const navLinks = wrapper.findAll('nav a')
    const linkTexts = navLinks.map((link) => link.text())
    expect(linkTexts).toContain('Home')
    expect(linkTexts).toContain('About')
  })
})

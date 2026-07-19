import Hero from '../components/home/Hero'
import ServicesSection from '../components/home/ServicesSection'
import PortfolioHighlight from '../components/home/PortfolioHighlight'
import InstagramFeed from '../components/home/InstagramFeed'
import CTABanner from '../components/home/CTABanner'

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <PortfolioHighlight />
      <InstagramFeed />
      <CTABanner />
    </>
  )
}

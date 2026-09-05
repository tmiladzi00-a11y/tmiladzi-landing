<script setup lang="ts">
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Privacy notice', description: 'What Tmiladzi Media collects about you, why, where it goes and how to get it back or have it deleted. Written for the Data Protection Act No. 3 of 2021.' })
const toc: [string, string][] = [
  ['#p-1', 'Who is responsible'], ['#p-2', 'What we collect'], ['#p-3', 'Why, and on what basis'], ['#p-4', 'Who else sees it'],
  ['#p-5', 'Where it is stored'], ['#p-6', 'How long we keep it'], ['#p-7', 'Your rights'], ['#p-8', 'Keeping it safe'], ['#p-9', 'Complaints'],
]
const basis: [string, string][] = [
  ['Answering your enquiry and quoting', 'Steps taken at your request before a contract'],
  ['Holding your date and running the shoot', 'Performance of our contract with you'],
  ['Invoicing, and chasing payment', 'Performance of contract, and our legitimate interest in being paid'],
  ['Tax and accounting records', 'Legal obligation'],
  ['Photographs and footage of people', 'Performance of contract with the client, and consent where we rely on a release'],
  ['Showing work in our portfolio', 'Our legitimate interest in marketing, subject to your right to opt out under clause 12 of our terms'],
]
const retention: [string, string][] = [
  ['Enquiries that do not become bookings', '12 months, then deleted'],
  ['Booking and client records', 'For the duration of the job and 6 years after, for tax and legal reasons'],
  ['Delivered photographs and footage', 'At least 12 months after delivery; often longer. See clause 13 of our terms'],
  ['Unselected and unedited frames', 'Usually deleted within 12 months of delivery'],
]
</script>

<template>
  <LegalPage title="Privacy notice" version="Version 1.0 · 3 September 2026" :toc="toc" toc-label="Privacy contents">
    <template #lede>
      What we collect about you, why, where it goes and how to get it back or have it
      deleted. Written for the Data Protection Act No. 3 of 2021.
    </template>
    <template #footer>
      {{ SITE.founder }}, trading as Tmiladzi Media. {{ SITE.street }}, {{ SITE.suburb }}, {{ SITE.city }},
      {{ SITE.region }} {{ SITE.postcode }}, {{ SITE.country }}. TPIN {{ SITE.tpin }}. Version 1.0, 3 September 2026.
    </template>

    <h2 id="p-1" class="display h3">Who is responsible for your data</h2>
    <p>The data controller is <strong>Tsolofelo Miladzi</strong>, trading as Tmiladzi Media,
      of 3 Chitambo Road, Riverside, Kitwe, Copperbelt 10101, Zambia.</p>
    <p>Questions, requests and complaints:
      <a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a> ·
      <a :href="SITE.phoneHref">{{ SITE.phone }}</a></p>

    <h2 id="p-2" class="display h3">What we collect</h2>
    <p class="sub">When you send a booking request</p>
    <TickList size="lg">
      <li>Your name, and a partner's or second contact's name where you give one</li>
      <li>Email address and phone number</li>
      <li>The venue or location, and whether it is inside or outside the Copperbelt</li>
      <li>The date and time of your event, and approximate number of guests</li>
      <li>Anything you write in the notes, and how you heard about us</li>
      <li>The coverage and add-ons you selected, and the resulting price and deposit</li>
    </TickList>
    <p class="sub mt-6">When you send a project brief</p>
    <TickList size="lg">
      <li>Your organisation, your name, email and phone number</li>
      <li>Sector, scope, dates, location and budget band</li>
      <li>Whether an NDA or site induction is required</li>
      <li>What you write about the objective of the work</li>
    </TickList>
    <p class="sub mt-6">When we photograph or film</p>
    <TickList size="lg">
      <li><strong>Photographs and footage of people are personal data.</strong> We treat them
          as such. That includes images of your guests, staff and members of the public who
          appear in work we make for you.</li>
      <li>Names and details you give us for captioning, interviews or releases</li>
    </TickList>
    <p class="sub mt-6">When you browse this site</p>
    <p>Nothing. This site sets no cookies, runs no analytics and no advertising trackers, and
      builds no profile of you. Information reaches us only when you choose to send a form.</p>

    <h2 id="p-3" class="display h3">Why we hold it, and on what basis</h2>
    <SpecTable :rows="basis" prose />

    <h2 id="p-4" class="display h3">Who else sees it</h2>
    <TickList size="lg">
      <li><strong>Google.</strong> Our booking system, calendar, email and records run on
          Google services. Your booking details are stored there.</li>
      <li><strong>Crew and subcontractors</strong> working on your job, limited to what they
          need to do it — usually the date, location and run sheet.</li>
      <li><strong>Our print supplier</strong>, where you order printed products and we send
          files to be produced.</li>
      <li><strong>Our bank and payment providers</strong>, to take and reconcile payment.</li>
      <li><strong>Authorities</strong>, where we are required by law to disclose.</li>
    </TickList>
    <p>We do not sell your information, and we do not share it for anyone else's marketing.</p>

    <h2 id="p-5" class="display h3">Where it is stored</h2>
    <p>Our booking records, calendar and email are held on Google infrastructure, which means
      your information is stored on servers <strong>outside Zambia</strong>. Photographs and
      footage are held on our own storage in Kitwe and, for delivery, on our client gallery
      platform.</p>
    <p>If you would prefer your booking details not to be held outside Zambia, tell us and we
      will take your booking by phone and keep it on local records instead.</p>

    <h2 id="p-6" class="display h3">How long we keep it</h2>
    <SpecTable :rows="retention" prose />

    <h2 id="p-7" class="display h3">Your rights</h2>
    <p>Under the Data Protection Act you can ask us to:</p>
    <TickList size="lg">
      <li>Tell you what we hold about you, and give you a copy</li>
      <li>Correct anything that is wrong</li>
      <li>Delete what we hold, where we are not required to keep it</li>
      <li>Stop using it for a particular purpose, including our portfolio</li>
      <li>Withdraw consent, where consent is what we relied on</li>
    </TickList>
    <p>Email <a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a>. We will respond within
      30 days. There is no charge.</p>
    <p><strong>A note on photographs.</strong> If you appeared in a photograph we took at
      someone else's event and you want it taken down from our channels, write to us and we
      will remove it. We may still need to keep the original file, because it forms part of
      the work we delivered to our client under contract.</p>

    <h2 id="p-8" class="display h3">Keeping it safe</h2>
    <p>Accounts holding client data use strong, unique passwords and two-factor
      authentication. Footage and images are backed up. Crew get access only to the job they
      are working on. If a breach occurs that is likely to affect your rights, we will tell
      you and the regulator.</p>

    <h2 id="p-9" class="display h3">Complaints</h2>
    <p>Come to us first — most things are a misunderstanding and we would like the chance to
      fix it. If you are not satisfied, you may complain to the data protection authority in
      Zambia established under the Data Protection Act No. 3 of 2021.</p>

    <template #aside>
      <SurfaceCard k="No tracking" class="mt-5">
        <p class="mt-0">This site sets no cookies and runs no analytics. Nothing about
          your visit reaches us unless you send a form.</p>
      </SurfaceCard>
    </template>
  </LegalPage>
</template>

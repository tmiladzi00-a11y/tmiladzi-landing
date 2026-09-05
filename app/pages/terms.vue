<script setup lang="ts">
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Terms of business', description: 'The terms you agree to when you book Tmiladzi Media for a wedding, event or portrait session. Written to be read, not to be survived.' })
const toc: [string, string][] = [
  ['#t-1', '1 · Who you contract with'], ['#t-2', '2 · Quotations and prices'], ['#t-3', '3 · How a date is held'],
  ['#t-4', '4 · The deposit'], ['#t-5', '5 · If you cancel'], ['#t-6', '6 · Moving your date'], ['#t-7', '7 · If we cancel'],
  ['#t-8', '8 · Outside anyone\'s control'], ['#t-9', '9 · What we need from you'], ['#t-10', '10 · People in the photographs'],
  ['#t-11', '11 · Who owns the work'], ['#t-12', '12 · Showing the work'], ['#t-13', '13 · Delivery and raw files'],
  ['#t-14', '14 · Paying the balance'], ['#t-15', '15 · Liability'], ['#t-16', '16 · If something goes wrong'],
  ['#t-17', '17 · Your personal information'], ['#t-18', '18 · Law and disputes'], ['#t-19', '19 · Changes'],
]
const weddingScale: [string, string][] = [
  ['More than 60 days before', 'Deposit retained. Nothing further to pay.'],
  ['30 to 59 days before', '50% of the total (the deposit counts towards it).'],
  ['15 to 29 days before', '75% of the total.'],
  ['14 days or fewer', '100% of the total.'],
]
const smallScale: [string, string][] = [
  ['More than 14 days before', 'Deposit retained. Nothing further to pay.'],
  ['7 to 13 days before', '50% of the total.'],
  ['6 days or fewer', '100% of the total.'],
]
</script>

<template>
  <LegalPage title="Terms of business" version="Version 1.0 · in force from 3 September 2026" :toc="toc" toc-label="Terms contents">
    <template #lede>
      These are the terms you agree to when you book us. They are written to be read,
      not to be survived. If anything here is unclear, ask before you pay — we would
      rather explain it now than argue about it later.
    </template>
    <template #footer>
      Tmiladzi Media is a business name of {{ SITE.founder }}, sole trader.
      {{ SITE.street }}, {{ SITE.suburb }}, {{ SITE.city }}, {{ SITE.region }} {{ SITE.postcode }}, {{ SITE.country }}. TPIN {{ SITE.tpin }}.
      Version 1.0, 3 September 2026.
    </template>

    <h2 id="t-1" class="display h3">1. Who you are contracting with</h2>
    <p>Tmiladzi Media is a business name used by <strong>Tsolofelo Miladzi</strong>, a sole
      trader of 3 Chitambo Road, Riverside, Kitwe, Copperbelt 10101, Zambia, TPIN 1017396972.
      In these terms "we", "us" and "the studio" mean that person. "You" means the person or
      organisation named on the booking or quotation.</p>
    <p>We are not currently registered for Value Added Tax. No VAT is added to our prices and
      none is chargeable on our services. Every price we quote is in Zambian Kwacha and is the
      amount you pay.</p>

    <h2 id="t-2" class="display h3">2. Quotations and prices</h2>
    <TickList size="lg">
      <li>Quotations are valid for 30 days from the date of issue.</li>
      <li>Prices published on this site are starting points for the coverage described. Your
          quotation is the price that applies.</li>
      <li>Travel, accommodation and any third-party costs are quoted separately and are not
          included in the package price unless the quotation says so.</li>
      <li>Where a shoot falls outside the Copperbelt, or outside Kitwe for our shorter
          services, a travel charge applies and is shown on the quotation.</li>
    </TickList>

    <h2 id="t-3" class="display h3">3. Booking, and how a date is held</h2>
    <p>Sending a booking request through this site is not a booking. It is a request. The
      sequence is:</p>
    <ol class="numlist">
      <li>You send a request and choose a date.</li>
      <li>We reply within one working day to say whether we are free and willing to take it.</li>
      <li>If we accept, we hold the date for <strong>72 hours</strong> and send you the
          deposit details.</li>
      <li>The booking is confirmed only when the deposit has reached us and we have confirmed
          that in writing. Until then the date is not yours.</li>
      <li>If the deposit does not arrive within 72 hours the date is released without further
          notice.</li>
    </ol>

    <h2 id="t-4" class="display h3">4. The deposit</h2>
    <p>The deposit is <strong>50% of the total</strong> shown on your quotation, and it is
      <strong>not refundable</strong>.</p>
    <p>That is not a penalty and it is not us keeping money for nothing. When we accept your
      date we stop offering it to anyone else. A Saturday sold once cannot be sold again, and
      a cancellation rarely leaves enough time to fill it. The deposit is the agreed cost of
      taking that date off the market.</p>
    <p>The deposit counts towards the total. The balance is due on delivery.</p>

    <h2 id="t-5" class="display h3">5. If you cancel</h2>
    <p>Tell us in writing as soon as you know. The deposit is retained in every case, and
      beyond a point the balance becomes payable too, because by then the date cannot
      realistically be resold.</p>
    <p class="sub">Weddings</p>
    <SpecTable :rows="weddingScale" prose />
    <p class="sub mt-6">Small events, family shoots and sessions</p>
    <SpecTable :rows="smallScale" prose />

    <h2 id="t-6" class="display h3">6. Moving your date</h2>
    <p>We would far rather move a date than lose it. You may reschedule <strong>once, without
      charge</strong>, if you give us more than 30 days' notice for a wedding, or more than 7
      days for any other booking, and we are free on the new date. The deposit moves with you.</p>
    <p>A second change, or a change inside those windows, is treated as a cancellation and a
      new booking. If the new date carries a higher price, the difference is payable.</p>

    <h2 id="t-7" class="display h3">7. If we cancel</h2>
    <p>If we cancel for any reason other than your breach of these terms, you get back
      <strong>everything you have paid, including the deposit</strong>, and we will do our best
      to find you another photographer of a comparable standard. Our liability in that
      situation is limited as set out in clause 15.</p>

    <h2 id="t-8" class="display h3">8. Things outside anyone's control</h2>
    <p>Serious illness, injury, bereavement, accident, vehicle failure on the way, civil
      unrest, government restriction, extreme weather that makes the shoot unsafe or
      impossible, or failure of equipment that cannot be replaced in time — none of these are
      anyone's fault.</p>
    <p>Where one of these prevents us attending, we will send a replacement photographer if we
      can find one you are happy with; otherwise we will reschedule, or refund what you have
      paid less the value of work already carried out. Where one of these prevents
      <em>your</em> event happening, we will move your date once without charge under clause 6,
      whatever the notice period.</p>

    <h2 id="t-9" class="display h3">9. On the day: what we need from you</h2>
    <p>Some of these sound small. Every one of them has cost somebody a photograph.</p>
    <TickList size="lg">
      <li><strong>Permission to be there.</strong> You confirm you have the venue's consent for
          photography and filming, and for any drone flying, and you will tell us of any
          restriction the venue imposes.</li>
      <li><strong>Mains power</strong> where lighting is needed. Our lights run off mains, not
          batteries. If there is no power at the location, tell us in advance so we can plan
          around it.</li>
      <li><strong>Access and time.</strong> Reasonable access to the spaces we need, and the
          time agreed in the run sheet. Time lost to access we could not get does not extend
          the coverage.</li>
      <li><strong>Someone who knows everyone.</strong> For group photographs, a named person
          who can gather and identify people. We cannot photograph a family group we cannot
          assemble.</li>
      <li><strong>A meal and somewhere to sit</strong> on any shoot over six hours, for each
          crew member.</li>
      <li><strong>Anyone who must not be photographed.</strong> Tell us before we start.</li>
    </TickList>

    <h2 id="t-10" class="display h3">10. The people in the photographs</h2>
    <p>Where we photograph at your event or on your premises, you confirm you have the
      authority to allow it and that you will tell those present that photography is taking
      place. Where children are photographed, you confirm a parent or guardian has consented.</p>
    <p>If someone asks us not to photograph them, we will not, and that is not a failure of
      our coverage.</p>

    <h2 id="t-11" class="display h3">11. Who owns the photographs</h2>
    <p>This clause matters more than it looks, and it does not say what most people expect.</p>
    <p>Under <strong>section 10(3) of the Copyright and Performance Rights Act</strong>,
      copyright in a photograph or film made on commission belongs by default to the person
      who <em>commissioned</em> it — that is, to <strong>you</strong>, not to us. Most
      photographers in Zambia do not know this. It means that without the clause below, we
      would have no right to show your wedding in our portfolio, and no right to license our
      own images to anyone.</p>
    <p>So we ask you to move ownership to us, and we give you back, for ever, everything you
      actually want to do with the pictures.</p>

    <p class="sub">11.1 · Acknowledgement</p>
    <p>The parties acknowledge that section 10(3) of the Copyright and Performance Rights Act
      may operate to vest first ownership of copyright in commissioned works in you as the
      Client. It is the express intention of the parties that legal and beneficial ownership
      of all copyright in the photographs, films and audio recordings created under this
      contract shall vest in Tmiladzi Media.</p>

    <p class="sub">11.2 · Assignment</p>
    <p>In consideration of us entering into this contract, you assign to Tmiladzi Media, by
      way of present assignment of copyright expected to arise in the future under
      <strong>sections 11(1), 11(3) and 11(4)</strong> of the Copyright and Performance
      Rights Act, the entire copyright and all related rights, throughout the world and for
      the full term of copyright including all renewals and extensions, in all photographs,
      films, audio recordings, raw footage and out-takes created under this contract, such
      assignment to take effect immediately upon the creation of each such work.</p>

    <p class="sub">11.3 · What you may do — your licence</p>
    <p>We grant you a perpetual, worldwide, non-exclusive, royalty-free licence to use the
      delivered photographs and films for your own personal and family purposes. Print them
      at any size, frame them, share them with family, post them on your own social media,
      keep them for ever. <strong>This licence takes effect when you have paid us in
      full.</strong></p>

    <p class="sub">11.4 · What to ask us about first</p>
    <TickList size="lg">
      <li>Selling the images, or licensing them to anyone else</li>
      <li>Entering them into a competition</li>
      <li>Supplying them to a business, magazine, blog or commercial account</li>
    </TickList>
    <p>Ask and we will usually say yes. It takes one email, and it is far easier than
      unwinding it afterwards.</p>

    <p class="sub">11.5 · Editing and credit</p>
    <p>Please do not crop out a watermark where one is applied, or apply filters that
      materially alter the colour or tone, before publishing. The edit is the work. Where you
      post publicly we ask — but do not require — that you credit
      <strong>@tmiladzimedia</strong>.</p>

    <p class="sub">11.6 · Being named as the author</p>
    <p>Section 24(1) of the Copyright and Performance Rights Act removes an author's moral
      rights in commissioned work. You agree that, notwithstanding that section, Tmiladzi
      Media may be identified as the author of the work, and that you will not subject it to
      distortion or mutilation prejudicial to our reputation.</p>

    <p class="sub">11.7 · Full ownership, if you want it</p>
    <p>Some clients want the copyright itself rather than a licence. That is available. It is
      a separate product and it is priced separately, because you are buying something we can
      then never show or license again. Ask and we will quote it.</p>

    <h2 id="t-12" class="display h3">12. Showing the work</h2>
    <p>We may show work we have made in our portfolio, on this site, on our social channels
      and in pitches to other clients. It is how we get the next job.</p>
    <p>You can opt out. Tell us in writing before the shoot and we will not publish anything
      from it. Where you have asked us to sign a non-disclosure agreement, or where your own
      rules restrict it, nothing is published without your written clearance — and that
      restriction survives the end of the job.</p>

    <h2 id="t-13" class="display h3">13. Delivery, and unedited files</h2>
    <TickList size="lg">
      <li>Delivery times run in calendar days from the shoot date, or from the day we receive
          anything we need from you, whichever is later.</li>
      <li>We deliver <strong>edited</strong> work. Editing is part of what you are buying, not
          a step you are paying us to skip.</li>
      <li>Unedited or raw files are not part of any package. Where we offer them as a priced
          add-on, they are supplied as they are, unretouched and unsequenced, and remain
          subject to clause 11.</li>
      <li>We do not deliver every frame taken. Frames that are technically or unflatteringly
          poor are not part of the work.</li>
      <li>Files are delivered through a private online gallery. Download and back up your own
          copy when you receive it.</li>
    </TickList>
    <p><strong>Archiving.</strong> We keep delivered work for at least <strong>12 months</strong>
      after delivery and will usually re-supply it free within that period. We often hold it
      for much longer, but after 12 months we do not guarantee it. Your own backup is the one
      that matters.</p>

    <h2 id="t-14" class="display h3">14. Paying the balance</h2>
    <p>The balance is due on delivery, and in any event within the number of days stated on
      your invoice. Overdue amounts carry interest at 5 percentage points above the Bank of
      Zambia Policy Rate, accruing monthly from the due date until payment. That is
      compensation for being kept out of our money, not a penalty.</p>
    <p>We may withhold delivery of final files until the balance has been paid. Copyright and
      the licence in clause 11 do not pass to you until we have been paid in full.</p>

    <h2 id="t-15" class="display h3">15. What we are liable for</h2>
    <p>We take this work seriously and we carry professional care into every job. But we are a
      small studio, and it is only fair that you know the limit of what you can recover from
      us before you book rather than after something goes wrong.</p>
    <TickList size="lg">
      <li>Our total liability to you for any claim connected with a booking is limited to
          <strong>the total fees you have paid us for that booking</strong>.</li>
      <li>We are not liable for indirect or consequential loss — lost profit, lost opportunity,
          the cost of re-staging an event, or distress arising from the loss of images.</li>
      <li>Nothing in these terms limits our liability for death or personal injury caused by
          our negligence, or for fraud. It is not lawful to limit those and we do not try to.</li>
    </TickList>

    <h2 id="t-16" class="display h3">16. If something goes wrong</h2>
    <p>Tell us within 14 days of delivery and give us a fair chance to put it right. Most
      problems are fixable and almost all of them are quicker to fix than to argue about.
      Email <a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a>.</p>

    <h2 id="t-17" class="display h3">17. Your personal information</h2>
    <p>How we handle your personal data is set out in our
      <NuxtLink to="/privacy">Privacy Notice</NuxtLink>, which forms part of these terms.</p>

    <h2 id="t-18" class="display h3">18. Law and disputes</h2>
    <p>These terms are governed by the laws of Zambia, and the courts of Zambia have
      jurisdiction. Before either of us goes near a court, we agree to try to resolve the
      matter directly, in good faith, for at least 21 days.</p>

    <h2 id="t-19" class="display h3">19. Changes to these terms</h2>
    <p>We may update these terms. The version that applies to your booking is the version in
      force on the day you paid your deposit, and we will send you a copy of it with your
      confirmation. Changes are never applied backwards to a confirmed booking.</p>

    <template #aside>
      <SurfaceCard k="Questions first" class="mt-5">
        <p class="mt-0">If a term doesn't work for your situation, say so before you pay.
          Most of this is negotiable on a corporate job.</p>
        <BaseButton size="sm" to="/contact" arrow class="mt-4">Talk to us</BaseButton>
      </SurfaceCard>
    </template>
  </LegalPage>
</template>

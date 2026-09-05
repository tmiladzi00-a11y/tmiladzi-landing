<script setup lang="ts">
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Commercial services terms', description: 'Commercial services terms for corporate, NGO, development, mining, banking and institutional clients of Tmiladzi Media. Attached to every quotation.' })
const toc: [string, string][] = [
  ['#c-1', '1 · Parties'], ['#c-2', '2 · Fees and payment'], ['#c-3', '3 · Scope and acceptance'], ['#c-4', '4 · Cancellation'],
  ['#c-5', '5 · Intellectual property'], ['#c-6', '6 · Confidentiality'], ['#c-7', '7 · Crew and site conditions'],
  ['#c-8', '8 · Data protection'], ['#c-9', '9 · Warranties and liability'], ['#c-10', '10 · Force majeure'], ['#c-11', '11 · General'],
]
const cancel: [string, string][] = [
  ['30 days or more', 'Committed costs that cannot be recovered'],
  ['15 to 29 days', '25% of the affected day rate, plus committed costs'],
  ['8 to 14 days', '50% of the affected day rate, plus committed costs'],
  ['7 days or fewer', '100% of the affected day rate, plus committed costs'],
]
</script>

<template>
  <LegalPage title="Commercial services terms" title-max="16ch" version="Version 1.0 · 3 September 2026" :toc="toc" toc-label="Commercial terms contents">
    <template #lede>
      For corporate, NGO, development, mining, banking and institutional clients.
      These terms are attached as a page of every quotation we issue — this page is a
      reference copy, not the contract itself.
    </template>
    <template #footer>
      {{ SITE.founder }} trading as Tmiladzi Media, sole trader. {{ SITE.street }}, {{ SITE.suburb }},
      {{ SITE.city }}, {{ SITE.region }} {{ SITE.postcode }}, {{ SITE.country }}. TPIN {{ SITE.tpin }}. Version 1.0, 3 September 2026.
    </template>

    <KeyTerms title="How the contract is formed" class="com__key">
      <li>The contract is the <strong>Quotation</strong> plus these
          terms plus any written variation signed by both parties.</li>
      <li>Accepting the quotation, issuing a purchase order that references it, or telling
          us to begin work, accepts these terms.</li>
      <li>Where the quotation conflicts with these terms on scope, fees, currency or
          timelines, <strong>the quotation prevails</strong>.</li>
    </KeyTerms>

    <h2 id="c-1" class="display h3">1. Parties</h2>
    <p>Services are provided by <strong>Tsolofelo Miladzi trading as Tmiladzi Media</strong>
      ("Provider"), a sole trader of 3 Chitambo Road, Riverside, Kitwe, Copperbelt 10101,
      Zambia, TPIN 1017396972, to the client named in the Quotation ("Client").</p>

    <h2 id="c-2" class="display h3">2. Fees, currency and payment</h2>
    <TickList size="lg">
      <li>All fees are quoted and payable in <strong>Zambian Kwacha</strong>. We do not quote
          or invoice in any other currency.</li>
      <li>Fees are exclusive of VAT. Provider is not currently VAT-registered; if that changes
          during the engagement, VAT will be added at the prevailing rate.</li>
      <li>For engagements over <strong>ZMW 20,000</strong>, 50% is payable on acceptance as a
          mobilisation payment, the balance on delivery. Mobilisation payments are
          non-refundable except where Provider is in uncured material breach.</li>
      <li>Invoices are payable within <strong>21 days</strong> unless the Quotation says
          otherwise.</li>
      <li>Overdue sums bear interest at 4% per annum above the Bank of Zambia Policy Rate,
          accruing daily. Provider may suspend work and withhold delivery while any undisputed
          sum is more than 14 days overdue.</li>
      <li>Client may withhold payment only for deliverables that materially fail to conform to
          the Quotation, and only where written particulars are given within 10 working days
          of delivery. Any undisputed portion remains payable when due.</li>
      <li>Third-party costs — travel, accommodation, permits, equipment hire, talent fees,
          licensed music — are charged in addition unless the Quotation says they are
          included.</li>
    </TickList>
    <p><strong>Withholding tax.</strong> Where Client is required by law to deduct withholding
      tax, Client shall provide a withholding tax certificate within 14 days of remittance to
      the Zambia Revenue Authority. The parties will co-operate in good faith to establish
      whether the services constitute management or consultancy fees for withholding tax
      purposes, and to obtain any available exemption certificate.</p>

    <h2 id="c-3" class="display h3">3. Scope, changes and acceptance</h2>
    <TickList size="lg">
      <li>The scope is that stated in the Quotation. Work outside it is a variation, quoted
          before it is performed.</li>
      <li>The number of revision rounds included is stated in the Quotation. Further rounds
          are chargeable.</li>
      <li>Deliverables are deemed accepted if Client gives no written notice of
          non-conformity, with particulars, within 10 working days of delivery.</li>
      <li>Timelines run from the later of: acceptance of the Quotation, receipt of the
          mobilisation payment, and Client providing site access, subjects, brand assets,
          approvals and information required. Client delays extend delivery dates day for day
          and may attract standby charges.</li>
    </TickList>

    <h2 id="c-4" class="display h3">4. Cancellation and postponement</h2>
    <SpecTable :rows="cancel" prose />
    <p>On termination for any reason other than Provider's uncured material breach, Client
      pays for all work performed to the date of termination, together with third-party costs
      reasonably committed and not recoverable.</p>

    <h2 id="c-5" class="display h3">5. Intellectual property</h2>
    <p>Read this clause properly. It does not work the way most commissioning agreements
      assume, because Zambian law does not work the way most people assume.</p>

    <p class="sub">5.1 · Acknowledgement</p>
    <p>The parties acknowledge that section 10(3) of the Copyright and Performance Rights Act
      may operate to vest first ownership of copyright in commissioned works in Client. It is
      the express intention of the parties that legal and beneficial ownership of all
      copyright and related rights in the Deliverables shall vest in Provider.</p>

    <p class="sub">5.2 · Assignment</p>
    <p>In consideration of Provider entering into this contract, Client hereby assigns to
      Provider, by way of present assignment of copyright expected to arise in the future
      pursuant to sections 11(1), 11(3) and 11(4) of the Copyright and Performance Rights Act,
      the entire copyright and all related rights, throughout the world and for the full term
      of copyright including all renewals, revivals and extensions, in all photographs,
      audiovisual works, sound recordings, raw footage, out-takes and other works created by
      or on behalf of Provider under this contract, such assignment to take effect immediately
      upon the creation of each such work.</p>

    <p class="sub">5.3 · Licence to Client</p>
    <p>Provider grants Client a <strong>perpetual, irrevocable, worldwide, non-exclusive,
      royalty-free licence</strong>, sublicensable to Client's group companies, to use,
      reproduce, modify, adapt, distribute, publish, publicly display and digitally transmit
      the delivered Deliverables <strong>for any business purpose of Client</strong>, in any
      medium now known or later developed.</p>
    <p><strong>This licence takes effect on payment in full. No usage rights arise before
      payment.</strong></p>

    <p class="sub">5.4 · What the licence does not include</p>
    <TickList size="lg">
      <li>Selling or licensing the Deliverables to a third party as stock or as a standalone
          product</li>
      <li>Sub-licensing outside Client's group</li>
      <li>Representing the Deliverables as Client's own creative work in an awards entry or
          credentials document without crediting Provider</li>
    </TickList>

    <p class="sub">5.5 · Raw files</p>
    <p>Raw and unedited footage, camera original files, project files and out-takes are not
      Deliverables and are not licensed. They may be purchased separately at Provider's
      published rate.</p>

    <p class="sub">5.6 · Full assignment</p>
    <p>Full assignment of copyright in any Deliverable is available at <strong>an additional
      100% of the fee for that Deliverable</strong>, effected by a separate written assignment
      signed by Provider on payment. Exclusivity, if required, is quoted separately.</p>

    <p class="sub">5.7 · Credit and integrity</p>
    <p>Client shall credit Provider as the creator wherever reasonably practicable, and shall
      not subject the Deliverables to any distortion, mutilation or other modification
      prejudicial to Provider's honour or reputation.</p>

    <p class="sub">5.8 · Provider's portfolio</p>
    <p>Provider may reproduce and display the Deliverables in its portfolio, on its website,
      in credentials and tender documents, and on its social media channels.</p>
    <p>Where Client requires prior approval, Provider will submit specific items for approval,
      such approval not to be unreasonably withheld or delayed and deemed given if Client does
      not respond within 10 working days. Provider will exclude material Client has marked
      confidential, material depicting restricted areas, and material depicting identifiable
      personnel who have not consented.</p>

    <p class="sub">5.9 · Client materials</p>
    <p>Client retains ownership of its logos, brand assets and any material it supplies, and
      grants Provider a licence to use them to produce the Deliverables, warranting it has the
      right to grant it.</p>

    <h2 id="c-6" class="display h3">6. Confidentiality</h2>
    <p>Each party will keep confidential the other's non-public information and use it only
      for the purposes of the engagement. That does not restrict Provider's rights under
      clause 5.8, and any confidentiality obligation Client wishes to impose must be recorded
      in the Quotation and is subject to the portfolio carve-out.</p>

    <h2 id="c-7" class="display h3">7. Crew, subcontractors and site conditions</h2>
    <TickList size="lg">
      <li>Provider may engage crew and subcontractors, remains responsible for their work, and
          ensures they are bound by equivalent confidentiality and intellectual property
          terms.</li>
      <li>Where work takes place on Client's premises or an operating site, Client shall
          provide safe access, notify Provider of known hazards, provide site induction and
          any site-specific personal protective equipment required by its own policies, and
          ensure its site insurance arrangements extend to Provider's personnel lawfully on
          site.</li>
    </TickList>

    <h2 id="c-8" class="display h3">8. Data protection and people in the work</h2>
    <TickList size="lg">
      <li>Each party will comply with the Data Protection Act No. 3 of 2021.</li>
      <li><strong>Client shall obtain and maintain all consents required from its own
          personnel, contractors and site visitors</strong> who are to be photographed or
          filmed, and shall provide evidence on request. Provider is responsible for consents
          only for persons it independently engages.</li>
      <li>Provider will hold personal data securely and will not use images of identifiable
          individuals in its own portfolio where consent has not been obtained.</li>
    </TickList>

    <h2 id="c-9" class="display h3">9. Warranties and liability</h2>
    <TickList size="lg">
      <li>Provider warrants it will perform with reasonable skill and care, in accordance with
          the Quotation, and that it holds the rights necessary to grant the licence in clause
          5.3.</li>
      <li>Nothing excludes liability for death or personal injury caused by negligence, for
          fraud, or for any liability that cannot lawfully be excluded.</li>
      <li>Subject to that, <strong>each party's</strong> aggregate liability is limited to the
          total fees paid under this contract in the 12 months preceding the event giving rise
          to the liability.</li>
      <li>Neither party is liable for indirect, special or consequential loss, or for loss of
          profit, revenue or opportunity.</li>
      <li><strong>Indemnity.</strong> Each party indemnifies the other against claims arising
          from its own negligence, wilful misconduct or breach, subject to the cap above.
          Client indemnifies Provider against claims arising from the condition of or access
          to Client's sites, from materials or instructions supplied by Client, and from
          Client's use of the Deliverables otherwise than as licensed.</li>
    </TickList>

    <h2 id="c-10" class="display h3">10. Force majeure</h2>
    <p>Neither party is liable for failure to perform caused by an event beyond its reasonable
      control. Where such an event prevents performance for more than 30 days either party may
      terminate, and Client shall pay for work performed and committed costs to that date.</p>

    <h2 id="c-11" class="display h3">11. General</h2>
    <TickList size="lg">
      <li>Provider is an independent contractor. Nothing creates employment, agency or
          partnership.</li>
      <li>Neither party may assign this contract without the other's written consent, not to
          be unreasonably withheld. <strong>Provider may novate this contract to a company
          incorporated by Tsolofelo Miladzi on written notice.</strong></li>
      <li>Governed by the laws of Zambia.</li>
      <li>Disputes will first be discussed in good faith for 30 days. Failing resolution they
          are referred to a single arbitrator under the Arbitration Act No. 19 of 2000, seated
          in Kitwe, in English.</li>
    </TickList>

    <template #aside>
      <SurfaceCard k="Negotiable" class="mt-5">
        <p class="mt-0">Most of this moves on a corporate engagement. Tell us what your
          procurement team needs and we will work with it — the clauses we hold hardest are
          5.2 and 9.3.</p>
        <BaseButton variant="primary" size="sm" to="/brief" arrow class="mt-4">Start a brief</BaseButton>
      </SurfaceCard>
    </template>
  </LegalPage>
</template>

<style scoped>
.com__key { margin: 0 0 var(--tm-sys-space-7); }
</style>

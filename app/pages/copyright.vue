<script setup lang="ts">
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Image use', description: 'Every photograph and film on this site was made by Tmiladzi Media. What you may do with them, and what you may not.' })
const toc: [string, string][] = [
  ['#i-1', 'Our work'], ['#i-2', 'If you are a client'], ['#i-3', 'Licensing our work'],
  ['#i-4', 'Client galleries'], ['#i-5', 'Reporting misuse'], ['#i-6', 'Asking to be removed'],
]
</script>

<template>
  <LegalPage title="Image use" :toc="toc" toc-label="Image use contents" :footer="false">
    <template #lede>
      Every photograph and film on this site was made by us. Here is what you may do with
      them, and what you may not.
    </template>

    <h2 id="i-1" class="display h3">Our work</h2>
    <p>Copyright in the photographs and films on this website belongs to Tmiladzi Media and is
      protected under the Copyright and Performance Rights Act.</p>
    <p class="sub">You may</p>
    <TickList size="lg">
      <li>Share a link to any page on this site</li>
      <li>Share our posts from our own social accounts using the platform's share function,
          with the credit intact</li>
    </TickList>
    <p class="sub mt-6">You may not, without written permission</p>
    <TickList size="lg">
      <li>Download, copy, repost, crop, screenshot, print or reuse any image or film</li>
      <li>Remove, obscure or alter any credit, watermark or embedded metadata</li>
      <li>Use our work in an advertisement, publication, tender document or website</li>
      <li>Use any automated system, scraper or crawler to harvest images from this site</li>
      <li><strong>Use our work to train, fine-tune or develop any machine learning or
          artificial intelligence model or dataset</strong></li>
      <li>Present our work in a way that suggests an association with, or endorsement by,
          Tmiladzi Media that does not exist</li>
    </TickList>
    <p>Reproducing our photographs or films without permission infringes copyright. Under
      section 28 of the Copyright and Performance Rights Act, as replaced by Act No. 25 of
      2010, certain infringing acts are also criminal offences.</p>

    <h2 id="i-2" class="display h3">If you are a client</h2>
    <p>The rights you hold in work we made for you are set out in your contract — the
      <NuxtLink to="/terms">Terms of business</NuxtLink> for private clients, or the
      <NuxtLink to="/commercial">Commercial services terms</NuxtLink> and your quotation
      for organisations.</p>
    <p>If you are unsure what you may do with your photographs — particularly if you want to
      license them onward, sell them, or supply them to a publication or an agency — ask us
      first. We are usually able to say yes, and we would much rather agree it than find out
      afterwards.</p>

    <h2 id="i-3" class="display h3">Licensing our work</h2>
    <p>Our images are available to license for commercial use. Tell us what you want to use,
      where, and for how long, and we will quote. Licensing is priced by use, not by file.</p>

    <h2 id="i-4" class="display h3">Client galleries</h2>
    <p>Access to client galleries is granted under the contract for the relevant project.
      Gallery access is personal to the client and the rights granted are those in the
      applicable terms — nothing more. Please do not share gallery credentials.</p>

    <h2 id="i-5" class="display h3">Reporting misuse</h2>
    <p>If you have seen our work used somewhere without credit or permission, please tell us:
      <a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a>.</p>

    <h2 id="i-6" class="display h3">Asking to be removed</h2>
    <p>If you appear in a photograph or film published on this website and would like it taken
      down, email <a :href="`mailto:${SITE.email}`">{{ SITE.email }}</a> and we will
      remove it. <strong>You do not need to give a reason.</strong></p>

    <template #aside>
      <SurfaceCard k="Want to use an image?" tone="mal" class="mt-5">
        <p class="mt-0">Ask. It is quick, it is often free for the right use, and it
          saves everyone a difficult conversation.</p>
        <BaseButton variant="primary" size="sm" to="/contact" arrow class="mt-4">Get in touch</BaseButton>
      </SurfaceCard>
      <SurfaceCard k="No AI training" class="mt-5">
        <p class="mt-0">This site blocks known AI training crawlers, and the prohibition
          above is the contractual half of the same position.</p>
      </SurfaceCard>
    </template>
  </LegalPage>
</template>

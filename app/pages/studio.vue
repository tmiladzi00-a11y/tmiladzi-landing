<script setup lang="ts">
import { PROCESS } from '~/content/process'
import { SITE } from '~/content/site'
useSeoMeta({ title: 'Studio', description: 'Tmiladzi Media was built in Kitwe by Tsolofelo Miladzi and has been in professional production since 2018. A Copperbelt studio with national reach.' })
</script>

<template>
  <div>
    <PageBand tight>
      <Eyebrow>About</Eyebrow>
      <h1 class="display h1 studio__h1">A Copperbelt studio with national reach.</h1>
    </PageBand>

    <PageBand tight flush>
      <div class="split">
        <div>
          <p class="lede">
            Tmiladzi Media was built in Kitwe by Tsolofelo Miladzi and has been in professional
            production since 2018. It started as one photographer with a camera and a habit of
            staying until the story made sense. It is now a studio of three permanent people who
            scale to a crew of eleven when a production demands it.
          </p>
          <p class="lede">
            We work where our clients work: on operating mine sites, in plant rooms and workshops,
            at rural project launches, in bank boardrooms and airport terminals, at State House,
            and in villages three hours off the tarmac. The brief is nearly always the same underneath — someone has done real work
            and needs the people who fund, regulate or buy from them to believe it.
          </p>
          <p class="lede">
            We are not trying to be the cheapest studio on the Copperbelt. We are trying to be
            the one a Lusaka agency loses the pitch to.
          </p>
          <div class="row">
            <BaseButton variant="primary" to="/brief" arrow>Work with us</BaseButton>
            <BaseButton to="/contact">Contact details</BaseButton>
          </div>
        </div>
        <div>
          <PlateFrame ratio="4-5" pa="#215F48" pb="#6B3E1E" tag="Portrait slot" :title="SITE.founder" sub="Founder · Director of photography" sizes="(min-width: 900px) 40vw, 100vw" />
          <dl class="studio__facts">
            <ContactRow term="Based">Kitwe, Copperbelt</ContactRow>
            <ContactRow term="Coverage">Zambia-wide · regional on request</ContactRow>
            <ContactRow term="Team">3 permanent · up to 11 on production</ContactRow>
            <ContactRow term="Since"><span class="num">2018</span></ContactRow>
          </dl>
        </div>
      </div>
    </PageBand>

    <PageBand dark labelledby="kit-h">
      <SectionHead id="kit-h" eyebrow="Kit & workflow" title="What we shoot on.">
        A deliberately narrow kit list. One camera system means one colour
        science, which is why a client's images from 2022 still sit next to this quarter's without a re-grade.
      </SectionHead>
      <ul class="grid g4 kit">
        <SurfaceCard tag="li" k="Cameras"><h3 class="h4">Canon mirrorless</h3><p>Full-frame bodies and a prime and zoom set covering wide site work through long-lens portraiture.</p></SurfaceCard>
        <SurfaceCard tag="li" k="Aerial & motion"><h3 class="h4">Drone · Ronin-S gimbal</h3><p>Aerial for site and landscape, subject to permissions; gimbal for walking and follow shots in plant and field.</p></SurfaceCard>
        <SurfaceCard tag="li" k="Post"><h3 class="h4">Adobe Premiere Pro</h3><p>Full Creative Cloud pipeline, with a fixed grade and export preset per client.</p></SurfaceCard>
        <SurfaceCard tag="li" k="Delivery"><h3 class="h4">Our own gallery</h3><p>Client galleries run on our own platform, so your library is not hostage to a third-party subscription.</p></SurfaceCard>
      </ul>
    </PageBand>

    <PageBand labelledby="pipe-h">
      <SectionHead id="pipe-h" eyebrow="How a job runs" title="The pipeline, in full." />
      <div class="split split--even">
        <ProcessList :steps="PROCESS.slice(0, 5)" />
        <ProcessList :steps="PROCESS.slice(5)" :offset="5" />
      </div>
    </PageBand>
  </div>
</template>

<style scoped>
.studio__h1 { max-width: 17ch; }
.studio__facts { margin: var(--tm-sys-space-5) 0 0; }
.kit { list-style: none; padding: 0; margin: 0; }
</style>

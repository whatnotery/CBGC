
(function () {
  'use strict';

  // -------------------------------------------------------------------
  // 1. Rocket.Chat webhook endpoint
  // -------------------------------------------------------------------
  const ROCKET_CHAT_WEBHOOK_URL =
    'https://chat.cornbreadgun.club/hooks/6ade7fd3ee1a7e7afa117b84/imXDRSEgr7AouNzqNjxhqfnPTGto7u5s69CyntvPnuJyZwJ4';

  // -------------------------------------------------------------------
  // 2. Base payload — no `attachments` (removed per spec)
  // -------------------------------------------------------------------
  const BASE_PAYLOAD = {
    alias: 'rocket.cat',
    text: 'Example message',
  };

  // -------------------------------------------------------------------
  // 3. Human-readable labels
  //    NOTE: '&' replaced with 'and' to avoid breaking the form parser
  //          (some parsers split on '&' before URL-decoding).
  // -------------------------------------------------------------------
  const FIELD_LABELS = {
    what_name_and_pronouns_do_you_use_required: 'Name and Pronouns',
    email: 'Email',
    how_did_you_hear_about_the_cornbread_community_gun_club: 'Heard About CBGC',
    what_do_you_hope_to_get_out_of_participation_with_CBGC: 'Hopes for Participation',
    how_would_you_describe_your_personal_political_ideology: 'Political Ideology',
    have_you_ever_been_involved_in_any_political_organizations: 'Political Organizations',
    do_you_have_any_previous_experience_with_firearms: 'Firearm Experience',
    are_there_safety_and_or_legal_reasons_you_should_not_be_around_firearms: 'Safety/Legal Reasons',
    if_yes_to_the_above_please_explain: 'Safety/Legal Explanation',
    are_you_now_or_have_you_ever_been_involved_in_any_military_or_law_enforcement_organizations: 'Military/Law Enforcement',
    if_yes_to_the_above_please_explain_your_involvement: 'Military/Law Enforcement Explanation',
  };

  // -------------------------------------------------------------------
  // 4. Wire up the form
  // -------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('cbgcForm');
    if (!form) {
      console.warn('[cbgc-form] #cbgcForm not found on this page.');
      return;
    }

    const statusEl = document.getElementById('statusMessage');

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (statusEl) {
        statusEl.textContent = 'Sending…';
        statusEl.className = 'text-sm text-gray-600';
      }

      // -------- Collect fields into a plain object --------
      const formData = new FormData(form);
      const fields = {};

      for (const [key, value] of formData.entries()) {
        const trimmed = typeof value === 'string' ? value.trim() : value;
        if (fields[key]) {
          if (!Array.isArray(fields[key])) fields[key] = [fields[key]];
          fields[key].push(trimmed);
        } else {
          fields[key] = trimmed;
        }
      }

      // -------- Build the readable Markdown text --------
      const readableText = Object.entries(fields)
        .filter(([, v]) => v !== '' && v != null)
        .map(([key, value]) => {
          const label = FIELD_LABELS[key] || key;
          const rendered = Array.isArray(value) ? value.join(', ') : value;
          return `**${label}:** ${rendered}`;
        })
        .join('\n');

      const payload = {
        alias: BASE_PAYLOAD.alias,
        text: readableText || BASE_PAYLOAD.text,
      };

      // -----------------------------------------------------------------
      // 5. Send — CORS-safe form-urlencoded, direct alias + text fields
      //
      //   • application/json would trigger a preflight OPTIONS that
      //     Rocket.Chat does not answer with ACAO → browser blocks.
      //   • application/x-www-form-urlencoded is a "simple" request
      //     → no preflight.
      //   • Do NOT wrap the JSON in `payload=` — Rocket.Chat does not
      //     unwrap Slack-style payload params; it parses the form body
      //     directly and requires `text` at the top level.
      //   • mode: 'no-cors' is still required to accept the (headerless)
      //     response. The response is opaque: status 0, ok false.
      //     Success/failure is NOT observable here — check the channel.
      // -----------------------------------------------------------------
      try {
        const params = new URLSearchParams();
        params.append('alias', payload.alias);
        params.append('text', payload.text);

        await fetch(ROCKET_CHAT_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (statusEl) {
          statusEl.textContent = '✅ Thanks! Your application has been submitted.';
          statusEl.className = 'text-sm text-green-700 font-bold';
        }
        form.reset();
      } catch (error) {
        // Only genuine network-layer failures reach here.
        console.error('[cbgc-form] Submission failed:', error);
        if (statusEl) {
          statusEl.textContent =
            '❌ Network error — please check your connection and try again.';
          statusEl.className = 'text-sm text-red-700 font-bold';
        }
      }
    });
  });
})();

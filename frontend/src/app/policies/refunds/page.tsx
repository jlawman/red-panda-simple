'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

const termsMarkdown = `

# A fair refund policy.

Bad refund policies are infuriating. You feel like the company is just trying to rip you off. We never want our customers to feel that way, so our refund policy is simple: If you’re ever unhappy with our products for any reason, just contact [our support team](mailto:support@translatethisvideo.com) and we'll take care of you.

## Examples of full refunds we’d grant.

* If you were just charged for your next month of service but you meant to cancel, we’re happy to refund that extra charge.
* If you forgot to cancel your account a couple months ago and you haven’t used it since then, we’ll give you a full refund for a few back months. No problem.
* If you tried one of our products for a couple months and you just weren’t happy with it, you can have your money back.

## Examples of partial refunds or credits we’d grant.

* If you forgot to cancel your account a year ago, and there’s been activity on your account since then, we’ll review your account usage and figure out a partial refund based on how many months you used it.
* If you upgraded your account a few months ago to a higher plan and kept using it in general but you didn’t end up using the extra minutes, we’d consider applying a prorated credit towards future months.
* If we had extended downtime (multiple hours in a day, or multiple days in a month) or you emailed customer service and it took multiple days to get back to you, we’d issue a partial credit to your account.


## Get in touch

At the end of the day, nearly everything on the edges comes down to a case-by-case basis. [Send us a note](mailto:support@translatethisvideo.com), tell us what's up, and we'll work with you to make sure you’re happy.

> Adapted from the [Basecamp open-source policies](https://github.com/basecamp/policies) / [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
`;

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState('');
  
  useEffect(() => {
    const parseMarkdown = async () => {
      const content = await marked(termsMarkdown);
      setTermsContent(content);
    };
    
    parseMarkdown();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-md" dangerouslySetInnerHTML={{ __html: termsContent }} />
    </div>
  );
}

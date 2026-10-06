# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: self-healing/brittle-calculator.feature.spec.js >> Legacy calculator flow (intentionally broken locators) >> Clicking Calculate (renamed CSS class)
- Location: .features-gen/self-healing/brittle-calculator.feature.spec.js:19:7

# Error details

```
TimeoutError: locator.click: Timeout 3000ms exceeded.
Call log:
  - waiting for locator('button.btn-calculate')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]: LoanLens
    - navigation "Main" [ref=e4]:
      - link "Dashboard" [ref=e5] [cursor=pointer]:
        - /url: /
      - link "EMI Calculator" [ref=e6] [cursor=pointer]:
        - /url: /calculator
  - main [ref=e7]:
    - heading "EMI Calculator" [level=1] [ref=e8]
    - tablist "Loan type" [ref=e9]:
      - tab "Home Loan" [selected] [ref=e10] [cursor=pointer]
      - tab "Personal Loan" [ref=e11] [cursor=pointer]
      - tab "Car Loan" [ref=e12] [cursor=pointer]
    - form "Loan details" [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: Home Loan Amount (₹)
        - spinbutton "Home Loan Amount (₹)" [ref=e16]: "5000000"
        - slider "Home Loan Amount (₹)" [ref=e17]: "5000000"
      - generic [ref=e18]:
        - generic [ref=e19]: Interest Rate (% p.a.)
        - spinbutton "Interest Rate (% p.a.)" [ref=e20]: "9"
        - slider "Interest Rate (% p.a.)" [ref=e21]: "9"
      - generic [ref=e22]:
        - generic [ref=e23]: Loan Tenure (years)
        - spinbutton "Loan Tenure (years)" [ref=e24]: "20"
        - slider "Loan Tenure (years)" [ref=e25]: "20"
      - generic [ref=e26]:
        - generic [ref=e27]: Schedule showing EMI payments starting from
        - textbox "Schedule showing EMI payments starting from" [ref=e28]: 2026-10
      - button "Calculate" [ref=e29] [cursor=pointer]
    - region [ref=e30]:
      - heading "Results" [level=2] [ref=e31]
      - generic [ref=e32]:
        - generic [ref=e33]:
          - term [ref=e34]: Monthly EMI
          - definition [ref=e35]: ₹44,986
        - generic [ref=e36]:
          - term [ref=e37]: Total Interest Payable
          - definition [ref=e38]: ₹57,96,711
        - generic [ref=e39]:
          - term [ref=e40]: Total Payment (Principal + Interest)
          - definition [ref=e41]: ₹1,07,96,711
      - generic [ref=e42]:
        - img "Break-up of total payment" [ref=e43]:
          - 'generic "Principal Loan Amount: ₹50,00,000 (46.3%)" [ref=e44]'
          - 'generic "Total Interest: ₹57,96,711 (53.7%)" [ref=e45]'
        - list "Break-up of total payment legend" [ref=e46]:
          - listitem [ref=e47]:
            - generic [ref=e49]: Principal Loan Amount
            - generic [ref=e50]: ₹50,00,000
            - generic [ref=e51]: 46.3%
          - listitem [ref=e52]:
            - generic [ref=e54]: Total Interest
            - generic [ref=e55]: ₹57,96,711
            - generic [ref=e56]: 53.7%
    - region [ref=e57]:
      - heading "Yearly payment schedule" [level=2] [ref=e58]
      - img "Yearly principal and interest" [ref=e60]:
        - 'listitem "2026: principal ₹22,628, interest ₹1,12,331" [ref=e61] [cursor=pointer]':
          - generic [ref=e64]: "2026"
        - 'listitem "2027: principal ₹95,758, interest ₹4,44,077" [ref=e65] [cursor=pointer]'
        - 'listitem "2028: principal ₹1,04,741, interest ₹4,35,095" [ref=e68] [cursor=pointer]':
          - generic [ref=e71]: "2028"
        - 'listitem "2029: principal ₹1,14,566, interest ₹4,25,269" [ref=e72] [cursor=pointer]'
        - 'listitem "2030: principal ₹1,25,313, interest ₹4,14,522" [ref=e75] [cursor=pointer]':
          - generic [ref=e78]: "2030"
        - 'listitem "2031: principal ₹1,37,069, interest ₹4,02,767" [ref=e79] [cursor=pointer]'
        - 'listitem "2032: principal ₹1,49,927, interest ₹3,89,909" [ref=e82] [cursor=pointer]':
          - generic [ref=e85]: "2032"
        - 'listitem "2033: principal ₹1,63,991, interest ₹3,75,845" [ref=e86] [cursor=pointer]'
        - 'listitem "2034: principal ₹1,79,374, interest ₹3,60,461" [ref=e89] [cursor=pointer]':
          - generic [ref=e92]: "2034"
        - 'listitem "2035: principal ₹1,96,201, interest ₹3,43,635" [ref=e93] [cursor=pointer]'
        - 'listitem "2036: principal ₹2,14,606, interest ₹3,25,230" [ref=e96] [cursor=pointer]':
          - generic [ref=e99]: "2036"
        - 'listitem "2037: principal ₹2,34,737, interest ₹3,05,098" [ref=e100] [cursor=pointer]'
        - 'listitem "2038: principal ₹2,56,757, interest ₹2,83,078" [ref=e103] [cursor=pointer]':
          - generic [ref=e106]: "2038"
        - 'listitem "2039: principal ₹2,80,843, interest ₹2,58,993" [ref=e107] [cursor=pointer]'
        - 'listitem "2040: principal ₹3,07,188, interest ₹2,32,648" [ref=e110] [cursor=pointer]':
          - generic [ref=e113]: "2040"
        - 'listitem "2041: principal ₹3,36,004, interest ₹2,03,831" [ref=e114] [cursor=pointer]'
        - 'listitem "2042: principal ₹3,67,524, interest ₹1,72,312" [ref=e117] [cursor=pointer]':
          - generic [ref=e120]: "2042"
        - 'listitem "2043: principal ₹4,02,000, interest ₹1,37,835" [ref=e121] [cursor=pointer]'
        - 'listitem "2044: principal ₹4,39,711, interest ₹1,00,125" [ref=e124] [cursor=pointer]':
          - generic [ref=e127]: "2044"
        - 'listitem "2045: principal ₹4,80,959, interest ₹58,877" [ref=e128] [cursor=pointer]'
        - 'listitem "2046: principal ₹3,90,102, interest ₹14,775" [ref=e131] [cursor=pointer]':
          - generic [ref=e134]: "2046"
      - table "Yearly payment schedule" [ref=e135]:
        - rowgroup [ref=e136]:
          - row [ref=e137]:
            - columnheader "Year" [ref=e138]
            - columnheader "Principal (A)" [ref=e139]
            - columnheader "Interest (B)" [ref=e140]
            - columnheader "Total Payment (A + B)" [ref=e141]
            - columnheader "Balance" [ref=e142]
        - rowgroup [ref=e143]:
          - row [ref=e144]:
            - rowheader "2026" [ref=e145]
            - cell "₹22,628" [ref=e146]
            - cell "₹1,12,331" [ref=e147]
            - cell "₹1,34,959" [ref=e148]
            - cell "₹49,77,372" [ref=e149]
          - row [ref=e150]:
            - rowheader "2027" [ref=e151]
            - cell "₹95,758" [ref=e152]
            - cell "₹4,44,077" [ref=e153]
            - cell "₹5,39,835" [ref=e154]
            - cell "₹48,81,614" [ref=e155]
          - row [ref=e156]:
            - rowheader "2028" [ref=e157]
            - cell "₹1,04,741" [ref=e158]
            - cell "₹4,35,095" [ref=e159]
            - cell "₹5,39,836" [ref=e160]
            - cell "₹47,76,873" [ref=e161]
          - row [ref=e162]:
            - rowheader "2029" [ref=e163]
            - cell "₹1,14,566" [ref=e164]
            - cell "₹4,25,269" [ref=e165]
            - cell "₹5,39,835" [ref=e166]
            - cell "₹46,62,307" [ref=e167]
          - row [ref=e168]:
            - rowheader "2030" [ref=e169]
            - cell "₹1,25,313" [ref=e170]
            - cell "₹4,14,522" [ref=e171]
            - cell "₹5,39,835" [ref=e172]
            - cell "₹45,36,993" [ref=e173]
          - row [ref=e174]:
            - rowheader "2031" [ref=e175]
            - cell "₹1,37,069" [ref=e176]
            - cell "₹4,02,767" [ref=e177]
            - cell "₹5,39,836" [ref=e178]
            - cell "₹43,99,925" [ref=e179]
          - row [ref=e180]:
            - rowheader "2032" [ref=e181]
            - cell "₹1,49,927" [ref=e182]
            - cell "₹3,89,909" [ref=e183]
            - cell "₹5,39,836" [ref=e184]
            - cell "₹42,49,998" [ref=e185]
          - row [ref=e186]:
            - rowheader "2033" [ref=e187]
            - cell "₹1,63,991" [ref=e188]
            - cell "₹3,75,845" [ref=e189]
            - cell "₹5,39,836" [ref=e190]
            - cell "₹40,86,007" [ref=e191]
          - row [ref=e192]:
            - rowheader "2034" [ref=e193]
            - cell "₹1,79,374" [ref=e194]
            - cell "₹3,60,461" [ref=e195]
            - cell "₹5,39,835" [ref=e196]
            - cell "₹39,06,633" [ref=e197]
          - row [ref=e198]:
            - rowheader "2035" [ref=e199]
            - cell "₹1,96,201" [ref=e200]
            - cell "₹3,43,635" [ref=e201]
            - cell "₹5,39,836" [ref=e202]
            - cell "₹37,10,432" [ref=e203]
          - row [ref=e204]:
            - rowheader "2036" [ref=e205]
            - cell "₹2,14,606" [ref=e206]
            - cell "₹3,25,230" [ref=e207]
            - cell "₹5,39,836" [ref=e208]
            - cell "₹34,95,826" [ref=e209]
          - row [ref=e210]:
            - rowheader "2037" [ref=e211]
            - cell "₹2,34,737" [ref=e212]
            - cell "₹3,05,098" [ref=e213]
            - cell "₹5,39,835" [ref=e214]
            - cell "₹32,61,088" [ref=e215]
          - row [ref=e216]:
            - rowheader "2038" [ref=e217]
            - cell "₹2,56,757" [ref=e218]
            - cell "₹2,83,078" [ref=e219]
            - cell "₹5,39,835" [ref=e220]
            - cell "₹30,04,331" [ref=e221]
          - row [ref=e222]:
            - rowheader "2039" [ref=e223]
            - cell "₹2,80,843" [ref=e224]
            - cell "₹2,58,993" [ref=e225]
            - cell "₹5,39,836" [ref=e226]
            - cell "₹27,23,488" [ref=e227]
          - row [ref=e228]:
            - rowheader "2040" [ref=e229]
            - cell "₹3,07,188" [ref=e230]
            - cell "₹2,32,648" [ref=e231]
            - cell "₹5,39,836" [ref=e232]
            - cell "₹24,16,300" [ref=e233]
          - row [ref=e234]:
            - rowheader "2041" [ref=e235]
            - cell "₹3,36,004" [ref=e236]
            - cell "₹2,03,831" [ref=e237]
            - cell "₹5,39,835" [ref=e238]
            - cell "₹20,80,295" [ref=e239]
          - row [ref=e240]:
            - rowheader "2042" [ref=e241]
            - cell "₹3,67,524" [ref=e242]
            - cell "₹1,72,312" [ref=e243]
            - cell "₹5,39,836" [ref=e244]
            - cell "₹17,12,771" [ref=e245]
          - row [ref=e246]:
            - rowheader "2043" [ref=e247]
            - cell "₹4,02,000" [ref=e248]
            - cell "₹1,37,835" [ref=e249]
            - cell "₹5,39,835" [ref=e250]
            - cell "₹13,10,771" [ref=e251]
          - row [ref=e252]:
            - rowheader "2044" [ref=e253]
            - cell "₹4,39,711" [ref=e254]
            - cell "₹1,00,125" [ref=e255]
            - cell "₹5,39,836" [ref=e256]
            - cell "₹8,71,061" [ref=e257]
          - row [ref=e258]:
            - rowheader "2045" [ref=e259]
            - cell "₹4,80,959" [ref=e260]
            - cell "₹58,877" [ref=e261]
            - cell "₹5,39,836" [ref=e262]
            - cell "₹3,90,102" [ref=e263]
          - row [ref=e264]:
            - rowheader "2046" [ref=e265]
            - cell "₹3,90,102" [ref=e266]
            - cell "₹14,775" [ref=e267]
            - cell "₹4,04,877" [ref=e268]
            - cell "₹0" [ref=e269]
```

# Test source

```ts
  14  |  */
  15  | export type AriaRole = Parameters<Page['getByRole']>[0];
  16  | 
  17  | export interface BrittleLocator {
  18  |   key: string;
  19  |   page: string;
  20  |   selector: string;
  21  |   /** Plain-language description of what this locator is supposed to find. */
  22  |   intent: string;
  23  |   /** Why it is brittle / how it breaks. */
  24  |   flaw: string;
  25  |   fingerprint: {
  26  |     role: AriaRole;
  27  |     name?: RegExp;
  28  |     /** For values without an accessible name (e.g. <dd>): the term that labels them. */
  29  |     term?: RegExp;
  30  |   };
  31  | }
  32  | 
  33  | export const BRITTLE_LOCATORS: BrittleLocator[] = [
  34  |   {
  35  |     key: 'amountInput',
  36  |     page: '/calculator',
  37  |     // Positional XPath: input[2] in the first field is now the range slider, not the text box.
  38  |     selector: 'xpath=//form/div[1]/input[2]',
  39  |     intent: 'Numeric text box where the user types the loan amount',
  40  |     flaw: 'Positional XPath — silently points at the wrong element (the slider) after a markup change',
  41  |     fingerprint: { role: 'spinbutton', name: /Loan Amount/ },
  42  |   },
  43  |   {
  44  |     key: 'rateInput',
  45  |     page: '/calculator',
  46  |     // Absolute XPath that assumes an old wrapper <div> around <main>.
  47  |     selector: 'xpath=/html/body/div[1]/main/form/div[2]/input[1]',
  48  |     intent: 'Numeric text box for the annual interest rate',
  49  |     flaw: 'Absolute XPath — breaks when any ancestor is added or removed',
  50  |     fingerprint: { role: 'spinbutton', name: /Interest Rate/ },
  51  |   },
  52  |   {
  53  |     key: 'calculateButton',
  54  |     page: '/calculator',
  55  |     // Styling class that was renamed during a CSS refactor (.btn-calculate → .primary).
  56  |     selector: 'button.btn-calculate',
  57  |     intent: 'Button that submits the loan form and calculates the EMI',
  58  |     flaw: 'Coupled to a presentational CSS class',
  59  |     fingerprint: { role: 'button', name: /^Calculate$/ },
  60  |   },
  61  |   {
  62  |     key: 'emiResult',
  63  |     page: '/calculator',
  64  |     // Stale auto-generated id from an earlier build.
  65  |     selector: '#emi-result-value-3f9a',
  66  |     intent: 'The calculated monthly EMI amount shown in the results panel',
  67  |     flaw: 'Generated id that changes between builds',
  68  |     fingerprint: { role: 'definition', term: /^Monthly EMI$/ },
  69  |   },
  70  |   {
  71  |     key: 'totalInterestResult',
  72  |     page: '/calculator',
  73  |     // nth-child chain plus a tag (<span>) that is now a <dd>.
  74  |     selector: 'section.results dl > div:nth-child(2) > span.value',
  75  |     intent: 'The total interest payable figure in the results panel',
  76  |     flaw: 'nth-child chain + tag/class assumptions about the DOM structure',
  77  |     fingerprint: { role: 'definition', term: /^Total Interest Payable$/ },
  78  |   },
  79  | ];
  80  | 
  81  | const byKey = (key: string) => BRITTLE_LOCATORS.find((l) => l.key === key)!.selector;
  82  | 
  83  | /** Short action timeout so the broken scenario fails fast rather than hanging. */
  84  | const QUICK = { timeout: 3_000 };
  85  | 
  86  | export class BrittleCalculatorPage {
  87  |   readonly amountInput: Locator;
  88  |   readonly rateInput: Locator;
  89  |   readonly calculateButton: Locator;
  90  |   readonly emiResult: Locator;
  91  |   readonly totalInterestResult: Locator;
  92  | 
  93  |   constructor(readonly page: Page) {
  94  |     this.amountInput = page.locator(byKey('amountInput'));
  95  |     this.rateInput = page.locator(byKey('rateInput'));
  96  |     this.calculateButton = page.locator(byKey('calculateButton'));
  97  |     this.emiResult = page.locator(byKey('emiResult'));
  98  |     this.totalInterestResult = page.locator(byKey('totalInterestResult'));
  99  |   }
  100 | 
  101 |   async open(): Promise<void> {
  102 |     await this.page.goto('/calculator');
  103 |   }
  104 | 
  105 |   async enterAmount(amount: number): Promise<void> {
  106 |     await this.amountInput.fill(String(amount), QUICK);
  107 |   }
  108 | 
  109 |   async enterRate(rate: number): Promise<void> {
  110 |     await this.rateInput.fill(String(rate), QUICK);
  111 |   }
  112 | 
  113 |   async calculate(): Promise<void> {
> 114 |     await this.calculateButton.click(QUICK);
      |                                ^ TimeoutError: locator.click: Timeout 3000ms exceeded.
  115 |   }
  116 | 
  117 |   async emiText(): Promise<string> {
  118 |     return (await this.emiResult.textContent(QUICK)) ?? '';
  119 |   }
  120 | 
  121 |   async totalInterestText(): Promise<string> {
  122 |     return (await this.totalInterestResult.textContent(QUICK)) ?? '';
  123 |   }
  124 | }
  125 | 
```
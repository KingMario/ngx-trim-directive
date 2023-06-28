import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Directive({
  selector: 'input[trim],textarea[trim]',
})
export class NgxTrimDirective implements OnInit, OnDestroy {

  private _trim: TrimOption = '';
  @Input('trim')
  public set trim(trimOption: TrimOption) {
    if (trimOption !== '' && trimOption !== 'blur' && trimOption !== false) {
      console.warn(`Note: The value ${JSON.stringify(trimOption)} is not assignable to the trim attribute.
        Only blank string (""), "blur" or false is allowed.`);

      this._trim = false;
      return;
    }

    this._trim = trimOption;

    setTimeout( // fix the `Expression has changed after it was checked` error

      () => {

        const elem = this.elementRef.nativeElement;

        const eleValue = elem.value;

        if (trimOption !== false && eleValue !== eleValue.trim()) {

          // initially trim the value if needed
          NgxTrimDirective.dispatchEvent(elem, 'blur');
        }

      },

    );
  }

  public get trim() {
    return this._trim;
  }

  @Input() trimOnWriteValue = true;

  private _valueAccessor: ControlValueAccessor | null = null;
  private _writeValue: ((value: any) => void) | null = null;

  constructor(
    private elementRef: ElementRef,
    @Optional() private ngControl: NgControl,
  ) {
  }

  private static getCaret(el: TrimElement) {

    return {
      start: el.selectionStart,
      end: el.selectionEnd,
    };

  }

  private static setCaret(el: TrimElement, start: number | null, end: number | null) {

    el.selectionStart = start;
    el.selectionEnd = end;

    el.focus();

  }

  private static dispatchEvent(el: TrimElement, eventType: string) {

    const event = new Event(eventType);
    el.dispatchEvent(event);

  }

  private static TrimOption(el: TrimElement, value: string) {

    el.value = value.trim();

    NgxTrimDirective.dispatchEvent(el, 'input');

  }

  ngOnInit(): void {

    if (!this.ngControl) {

      console.warn(
        'Note: The trim directive should be used with one of ngModel, formControl or formControlName directives.');

      return;

    }

    this._valueAccessor = this.ngControl.valueAccessor;

    if (this._valueAccessor) {
      this._writeValue = this._valueAccessor.writeValue;
      this._valueAccessor.writeValue = (value) => {
        const _value =
          this.trim === false || !value || 'function' !== typeof value.trim || !this.trimOnWriteValue
            ? value
            : value.trim();

        if (this._writeValue) {
          this._writeValue.call(this._valueAccessor, _value);
        }

        if (value !== _value) {
          if ((this._valueAccessor as any)['onChange']) {
            (this._valueAccessor as any)['onChange'](_value);
          }

          if ((this._valueAccessor as any)['onTouched']) {
            (this._valueAccessor as any)['onTouched']();
          }
        }

      };
    }

  }

  ngOnDestroy(): void {

    if (this._valueAccessor && this._writeValue) {

      this._valueAccessor.writeValue = this._writeValue;

    }

  }

  @HostListener('blur', [
    '$event.target',
    '$event.target.value',
  ])
  onBlur(el: any, value: string): void {
    if (this.trim === false) {

      return;

    }

    if ((this.trim === '' || 'blur' === this.trim) && 'function' === typeof value.trim && value.trim() !== value) {

      NgxTrimDirective.TrimOption(el, value);
      NgxTrimDirective.dispatchEvent(el, 'blur'); // in case updateOn is set to blur

    }

  }

  @HostListener('input', [
    '$event.target',
    '$event.target.value',
  ])
  onInput(el: any, value: string): void {

    if (this.trim === false) {

      return;

    }

    if (this.trim === '' && 'function' === typeof value.trim && value.trim() !== value) {

      let { start, end } = NgxTrimDirective.getCaret(el);

      if (value[0] === ' ' && start === 1 && end === 1) {

        start = 0;
        end = 0;

      }

      NgxTrimDirective.TrimOption(el, value);

      NgxTrimDirective.setCaret(el, start, end);

    }

  }

}

type TrimElement = HTMLInputElement | HTMLTextAreaElement;

export type TrimOption = '' | 'blur' | false;
